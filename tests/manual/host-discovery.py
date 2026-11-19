"""Run both real CLI startup paths against a scripted loopback model (Linux/POSIX)."""
import json
import os
from pathlib import Path
import secrets
import shlex
import shutil
import subprocess
import tempfile
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread

REPO = Path(__file__).resolve().parents[2]
DOCS = ["AGENTS.md", "docs/INSTRUCTION-SOURCE.md", "docs/guides/ASSISTANT-GUIDE.md"]
PROMPT = "Plan ten minutes of pottery practice."


def run(*args, **kwargs):
    return subprocess.run(args, check=True, capture_output=True, text=True, **kwargs).stdout.strip()


def codex_events(model, step, command):
    if command:
        item = dict(type="function_call", name="exec_command", call_id=f"call_{step}",
                    arguments=json.dumps(dict(cmd=command, login=False)))
    else:
        item = dict(type="message", role="assistant", content=[
            dict(type="output_text", text="Fixture response.", annotations=[])])
    item.update(id=f"item_{step}", status="completed")
    response = dict(id=f"resp_{step}", object="response", status="completed", model=model,
                    output=[item], usage=dict(input_tokens=1, output_tokens=1, total_tokens=2))
    return [
        ("response.created", dict(response=dict(response, status="in_progress", output=[]))),
        ("response.output_item.added", dict(output_index=0, item=item)),
        ("response.output_item.done", dict(output_index=0, item=item)),
        ("response.completed", dict(response=response)),
    ]


def claude_events(model, step, command):
    message = dict(id=f"msg_{step}", type="message", role="assistant", model=model, content=[],
                   stop_reason=None, stop_sequence=None, usage=dict(input_tokens=1, output_tokens=1))
    if command:
        block = dict(type="tool_use", id=f"toolu_{step}", name="Bash", input={})
        delta = dict(type="input_json_delta", partial_json=json.dumps(
            dict(command=command, description="Read fictional fixture")))
    else:
        block = dict(type="text", text="")
        delta = dict(type="text_delta", text="Fixture response.")
    return [
        ("message_start", dict(message=message)),
        ("content_block_start", dict(index=0, content_block=block)),
        ("content_block_delta", dict(index=0, delta=delta)),
        ("content_block_stop", dict(index=0)),
        ("message_delta", dict(delta=dict(stop_reason="tool_use" if command else "end_turn",
                                          stop_sequence=None), usage=dict(output_tokens=1))),
        ("message_stop", {}),
    ]


def exercise(host, binary, root, mode, binding, steps):
    configured = mode != "absent"
    project = root / (host + "-" + mode)
    project.mkdir()
    run("git", "init", "-q", project)
    if configured:
        (project / ("AGENTS.md" if host == "codex" else "CLAUDE.local.md")).write_text(binding)
    # Only project discovery can introduce the unique reader path into ordinary-task context.
    reader = str(root / "reader.sh")
    step = 0
    requests = 0
    error = ""

    class Endpoint(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_POST(self):
            nonlocal step, requests, error
            path = self.path.split("?")[0]
            if path not in ("/v1/messages", "/v1/responses"):
                self.send_error(404)
                return
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            if host == "claude":
                inputs = [body.get("system"), body["messages"]]
                results = [b for m in body["messages"] if isinstance(m["content"], list)
                           for b in m["content"] if b.get("type") == "tool_result"]
            else:
                inputs = [body.get("instructions"), body["input"]]
                results = [i for i in body["input"] if i.get("type") == "function_call_output"]
            if requests == 0:
                initial = json.dumps(inputs)
                if (reader in initial) != configured:
                    error = "unexpected binding discovery"
                if configured and not all(json.dumps(line)[1:-1] in initial for line in binding.splitlines() if line):
                    error = "incomplete project binding"
            if step and (not results or steps[step-1][1] not in json.dumps(results[-1])):
                error = f"missing expected result from read {step}"
            requests += 1
            command = None
            if configured and not error and step < len(steps):
                command = steps[step][0]
                step += 1
            events = (codex_events if host == "codex" else claude_events)(body["model"], requests, command)
            payload = "".join(f"event: {k}\ndata: {json.dumps(dict(v, type=k))}\n\n" for k, v in events).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    home = root / (project.name + "-home")
    (home / "codex").mkdir(parents=True)
    with HTTPServer(("127.0.0.1", 0), Endpoint) as server:
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        url = f"http://127.0.0.1:{server.server_port}"
        env = dict(HOME=str(home), CODEX_HOME=str(home / "codex"), CLAUDE_CONFIG_DIR=str(home / "claude"),
                   PATH=os.defpath, LANG="C.UTF-8", TERM="dumb", NO_PROXY="127.0.0.1",
                   HTTP_PROXY="http://127.0.0.1:1", HTTPS_PROXY="http://127.0.0.1:1",
                   ALL_PROXY="http://127.0.0.1:1", ANTHROPIC_BASE_URL=url,
                   ANTHROPIC_API_KEY="fictional-local-probe", CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1",
                   DISABLE_TELEMETRY="1", DISABLE_ERROR_REPORTING="1", DO_NOT_TRACK="1")
        if host == "codex":
            args = ["exec", "--ephemeral", "--ignore-user-config", "--ignore-rules", "-s", "read-only",
                    "-m", "gpt-5.4", "-c", 'model_provider="fixture"', "-c", 'model_providers.fixture.name="Fixture"',
                    "-c", 'model_providers.fixture.wire_api="responses"', "-c", f'model_providers.fixture.base_url="{url}/v1"',
                    "-c", "model_providers.fixture.supports_websockets=false"]
        else:
            args = ["-p", "--strict-mcp-config", "--no-session-persistence", "--setting-sources", "project,local",
                    "--model", "sonnet", "--tools", "Bash", "--permission-mode", "dontAsk"]
            if configured and mode != "denied":
                args += ["--add-dir", str(root / "data"), str(root / "source"), "--allowedTools",
                         *[f"Bash({command})" for command, _ in steps]]
            args.append("--")
        try:
            result = subprocess.run([binary, *args, PROMPT], cwd=project, env=env, capture_output=True,
                                    text=True, timeout=60, stdin=subprocess.DEVNULL)
        finally:
            server.shutdown()
            thread.join()
    expected_requests = len(steps) + 1 if configured else 1
    if error or result.returncode or requests != expected_requests:
        raise RuntimeError(f"{project.name}: {error or 'unexpected CLI outcome'}, exit {result.returncode}, "
                           f"requests {requests}/{expected_requests}\n{result.stderr[-900:]}")
    print(f"{project.name}: {step} expected tool results verified")


def main():
    binaries = {host: shutil.which(host) for host in ["codex", "claude"]}
    if not all(binaries.values()):
        raise SystemExit("Install both Codex CLI and Claude Code before running the host check.")
    with tempfile.TemporaryDirectory(prefix="fictional-hosts-") as directory:
        root = Path(directory).resolve()
        source, data, reader = root / "source", root / "data", root / "reader.sh"
        run("git", "clone", "--quiet", "--no-local", REPO, source)
        pin = run("git", "-C", source, "rev-parse", "HEAD")
        origin = run("git", "-C", source, "remote", "get-url", "origin")
        run("node", source / "tools/setup.mjs", "init", "--dest", data)
        shutil.copyfile(REPO / "examples/hosts/read-pinned-guide.sh", reader)
        canary = "Pottery practice " + secrets.token_hex(8)
        with (data / "domains/preferences.md").open("a") as note:
            note.write("\n" + canary + "\n")
        binding = (REPO / "examples/hosts/binding.md").read_text()
        for placeholder, value in [("absolute reviewed reader path", reader), ("absolute verified checkout root", source),
                                   ("exact repository origin", origin), ("full verified commit ID", pin),
                                   ("absolute selected data directory", data)]:
            binding = binding.replace("<" + placeholder + ">", str(value))
        steps = [(shlex.join(["sh", str(reader), str(source), origin, pin, doc]),
                  run("git", "-C", source, "show", f"{pin}:{doc}").splitlines()[0]) for doc in DOCS]
        steps.extend([(shlex.join(["cat", str(data / ".life-profile.json")]), "life-profile-private"),
                      (shlex.join(["cat", str(data / "domains/preferences.md")]), canary)])
        for host, binary in binaries.items():
            exercise(host, binary, root, "configured", binding, steps)
            exercise(host, binary, root, "absent", binding, steps)
            missing_pin = "0" * len(pin)
            failed_read = [(steps[0][0].replace(pin, missing_pin), "Life Profile source unavailable")]
            exercise(host, binary, root, "unavailable", binding.replace(pin, missing_pin), failed_read)
            if host == "claude":
                denied_read = [(steps[0][0], "denied")]
                exercise(host, binary, root, "denied", binding, denied_read)


if __name__ == "__main__":
    main()
