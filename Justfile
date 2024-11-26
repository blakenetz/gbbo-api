setup:
    #!/usr/bin/env bash
    set -euxo pipefail
    VENV_PATH="{{justfile_directory()}}/venv/"

    cd {{justfile_directory()}};
    if [ ! -d $VENV_PATH ]; then
        echo "🍰 Setting up new environment";
        python3 -m venv $VENV_PATH;
        source ${VENV_PATH}bin/activate;
        pip install --upgrade pip;
        pip install -r requirements.txt;
    else
        echo "🍰 Project already setup. Try serving with \n\`just serve\`";
    fi;

## Serve docs locally
serve:
    #!/usr/bin/env bash
    set -euxo pipefail
    VENV_PATH="{{justfile_directory()}}/venv/"

    cd {{justfile_directory()}};
    if [ ! -d $VENV_PATH ]; then
        echo "🍰 it doesn't appear this project has been setup. Try running\n\`just setup\`";
    else
        echo "🍰 Serving...";
        source ${VENV_PATH}bin/activate;
        fastapi dev main.py
    fi;