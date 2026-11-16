#!/usr/bin/env python3
"""固定来源与完整性，离线打包官方Aora；不运行远端安装脚本或连接用户设备。"""
import base64
import hashlib
import io
import json
import pathlib
import re
import tarfile
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
COMMIT = "164ffa38b3c27a8512e7c09cfceb7cf0c98f5144"
VERSION = "0.2.0"
INTEGRITY = "YyFThF8C2al4MBuXWDaFs23IYerv286vZkhznWKdVYKoQxryFHapttVmmEXPcFsgPdorxJrD1hCqJ43yO/TaQA=="
BUNDLE = ROOT / "app/VibeKey/Pet/Resources/AoraPet.bundle"


def download(url):
    with urllib.request.urlopen(url, timeout=60) as response:
        return response.read()


def main():
    package = download(f"https://registry.npmjs.org/@aora-bot/engine/-/engine-{VERSION}.tgz")
    actual = base64.b64encode(hashlib.sha512(package).digest()).decode()
    if actual != INTEGRITY:
        raise SystemExit("Aora npm integrity mismatch; no assets changed")
    with tarfile.open(fileobj=io.BytesIO(package), mode="r:gz") as archive:
        engine = archive.extractfile("package/dist/index.js").read().decode()
        license_text = archive.extractfile("package/LICENSE").read()
        readme = archive.extractfile("package/README.md").read()
        theme_sources = {pathlib.PurePosixPath(m.name).name: archive.extractfile(m).read().decode()
                         for m in archive.getmembers()
                         if m.isfile() and m.name.startswith("package/dist/themes/") and m.name.endswith(".js")}
    match = re.search(r"export \{([^}]+)\};\s*$", engine)
    if not match:
        raise SystemExit("Unexpected Aora export layout; manual review required")
    properties = []
    for item in match.group(1).split(","):
        words = item.strip().split(" as ")
        properties.append(words[0] if len(words) == 1 else words[1] + ": " + words[0])
    classic = engine[:match.start()] + "globalThis.Aora = { " + ", ".join(properties) + " };\n"
    classic += "globalThis.AoraPetPalette = {shadeHex,mixHex,faceInks,lineInks,hairShade,effectInks,partColorPair};\n"
    # Archive paths are never used for unrestricted extraction. Only ordinary source files in this prefix are copied.
    source = download(f"https://codeload.github.com/sam70361/aora-bot/tar.gz/{COMMIT}")
    files = {}
    with tarfile.open(fileobj=io.BytesIO(source), mode="r:gz") as archive:
        for member in archive.getmembers():
            parts = pathlib.PurePosixPath(member.name).parts
            if not member.isfile() or not parts or parts[0] != f"aora-bot-{COMMIT}":
                continue
            relative = pathlib.PurePosixPath(*parts[1:])
            if ".." in relative.parts:
                raise SystemExit("Unsafe source archive path")
            if str(relative).startswith("packages/engine/src/") or str(relative) in ("LICENSE", "package.json", "pnpm-lock.yaml"):
                files[relative] = archive.extractfile(member).read()
    if not files or pathlib.PurePosixPath("LICENSE") not in files:
        raise SystemExit("Source snapshot is missing its license")
    BUNDLE.mkdir(parents=True, exist_ok=True)
    for name, data in {"engine.mjs": engine.encode(), "engine.js": classic.encode(),
                       "LICENSE": license_text, "UPSTREAM-README.md": readme}.items():
        (BUNDLE / name).write_bytes(data)
    themes = BUNDLE / "themes"
    themes.mkdir(exist_ok=True)
    for name, source_text in theme_sources.items():
        exports = re.search(r"export \{([^}]+)\};\s*$", source_text)
        if not exports:
            raise SystemExit("Unexpected Aora theme export layout")
        theme_id = name.removesuffix(".js")
        source_text = source_text[:exports.start()]
        source_text = re.sub(r'import \{ EXTRAS \} from [\"\x27]\./extras.js[\"\x27];',
                             'const { EXTRAS } = globalThis.AoraThemeExtras;', source_text)
        props = []
        for item in exports.group(1).split(","):
            words = item.strip().split(" as ")
            props.append(words[0] if len(words) == 1 else words[1] + ": " + words[0])
        target = "globalThis.AoraThemeExtras" if theme_id == "extras" else "globalThis.AoraThemes[" + json.dumps(theme_id) + "]"
        wrapped = "/* Aora Bot 0.2.0; original LICENSE applies. */\n(() => {\n" + source_text + "\n" + target + " = {" + ", ".join(props) + "};\n})();\n"
        (themes / name).write_text(wrapped)
    for relative, data in files.items():
        destination = ROOT / "vendor/aora-bot" / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    manifest = {"name": "Aora Bot", "version": VERSION, "source": "https://github.com/sam70361/aora-bot",
                "sourceCommit": COMMIT, "npmIntegrity": "sha512-" + INTEGRITY,
                "transformation": "Engine and all built-in theme ESM exports wrapped in local globals for file WKWebView; palette helpers exposed for the compact geometry exporter; no upstream algorithm changes."}
    (BUNDLE / "upstream.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Vendored Aora {VERSION}, source {COMMIT}, verified SHA-512, {len(files)} source files")


if __name__ == "__main__":
    main()
