# Remove Background Workflow

Remove a background from an existing image with the optional local `rembg` adapter. HALOS does not install this dependency and does not ship the retired `RemoveBg.ts` wrapper.

## Consent and prerequisites

Installing `rembg` downloads Python packages and, on first use, an ONNX model. Explain that cost and obtain approval before installation. Prefer an already available binary:

```bash
command -v rembg
```

If the principal approves installation, use the environment's normal isolated-tool mechanism, for example:

```bash
pipx install 'rembg[cpu]'
# or: uv tool install 'rembg[cpu]'
```

Do not assume `~/.local/bin`; use the path returned by `command -v rembg`.

## Procedure

1. Verify the source file and choose a distinct PNG output path.
2. Run the local adapter.
3. Verify that the output is a PNG with alpha.
4. Replace the original only after verification and only when requested.

```bash
rembg i input-image.jpg output-image.png
file output-image.png
magick identify -format '%[channels]\n' output-image.png
```

The channel report must contain alpha (commonly `srgba`). If ImageMagick is unavailable, inspect the output with an image-capable tool rather than claiming transparency from the `.png` extension alone.

### Batch processing

Never overwrite the input during generation. Produce explicit sibling outputs:

```bash
for input in img1.png img2.png img3.png; do
  output="${input%.*}-transparent.png"
  rembg i "$input" "$output" || exit 1
done
```

Verify every output before deleting or replacing a source file.

## Quality options

When the default model produces poor edges, try a supported model after checking the installed `rembg --help`:

```bash
rembg i -m isnet-general-use input.png output.png
rembg i -m birefnet-general input.png output.png
rembg i -m birefnet-portrait portrait.png portrait-transparent.png
```

The first run may download a model and can take substantially longer. This is expected; it is not evidence that the command has hung.

## Fallbacks

If local installation is declined or unavailable:

- use an already configured image-editing capability that can return true alpha;
- use an approved external background-removal service, disclosing that the image leaves the machine; or
- report the limitation and preserve the original.

Never fabricate a transparent result by changing the extension or painting a checkerboard into the image.

## Verification record

Report the actual input path, output path, command/provider used, and the alpha-channel check. A successful command without an inspected output is incomplete.
