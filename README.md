## OhMyGAH (Oh My GitHub Actions Helper)

### Installation

To install OhMyGAH, use the following command:

```bash
npm install ohmygah
```

### Usage

OhMyGAH provides a command-line interface and is invoked using `omg`. For a list of available commands, type:

```bash
omg -h
```

### Commands Overview

| Command                  | Description                                   |
|--------------------------|-----------------------------------------------|
| `omg -h, --help`         | Displays help information.                   |
| `omg -V, --version`      | Shows the version information.               |
| `omg swap <action> <tag>`| Swaps the specified action to use the given version tag. |

### Examples

#### Update actions/checkout from @v2 to @v3
```bash
omg swap actions/checkout @v3
```