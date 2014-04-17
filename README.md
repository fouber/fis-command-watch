# watch and exec cmd

## install

1. install fis

    ```bash
    npm install -g fis
    ```

1. install fis-command-watch

    ```bash
    npm install -g fis-command-watch
    ```

## usage

```text
Usage: watch <cmd> [options]

Options:

  -h, --help         output usage information
  -r, --root <path>  document root
  --timeout <msec>   command exec timeout
  --include <glob>   file include filter
  --exclude <glob>   file exclude filter
```

> example: fis watch -r www 'cordova prepare'