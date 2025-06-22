# Macro Compilation

## Usage

Run the following command to compile macros:

```bash
npm run compile:macros
```

### Default Behavior

- Targets the `[root]/macros` folder.
- Compiles to nested `_compiled_jsons` and `_compiled_levelDB` folders for temporary storage.

### Optional Parameters

You can specify custom input and output directories using the following parameters:

- `--in`: Specify the input directory (default: `macros`).
- `--out`: Specify the output directory (default: `macros/_compiled_jsons`).

Example:

```bash
npm run compile:macros -- --in custom_macros --out custom_output
```

## FVTT CLI Commands

The script runs the following commands:

1. Pack macros into LevelDB:
   ```bash
   fvtt package pack -n "macros" --in "path/to/compiled_jsons" --out "path/to/_compiled_levelDB"
   ```
2. Unpack LevelDB:
   ```bash
   fvtt package unpack -n "macros" --in "path/to/compiled_levelDB" --out "path/to/_test_unpacked_jsons"
   ```

### Note

Ensure the FVTT CLI is installed and configured correctly to use these commands.