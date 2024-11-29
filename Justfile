## Setup project and initialize DB
setup:
    #!/usr/bin/env bash
    set -euxo pipefail
    cd {{justfile_directory()}}
    VENV_PATH="{{justfile_directory()}}/venv/"

    if [ ! -d $VENV_PATH ]; then
        echo "🍰 Setting up new environment"
        python3 -m venv $VENV_PATH
        source ${VENV_PATH}bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        python db-setup.py
    else
        echo "🍰 Project already setup!"
    fi

# Initialize DB
db:
    #!/usr/bin/env bash
    set -euxo pipefail
    cd {{justfile_directory()}}
    VENV_PATH="{{justfile_directory()}}/venv/"

    if [ ! -d $VENV_PATH ]; then
        echo "🍰 it doesn't appear this project has been setup. Try running\n\`just setup\`"
    else
        source ${VENV_PATH}bin/activate
        echo "🍰 DB setup..."
        python db-setup.py
    fi

## Serve API locally
serve:
    #!/usr/bin/env bash
    set -euxo pipefail
    cd {{justfile_directory()}}
    VENV_PATH="{{justfile_directory()}}/venv/"

    if [ ! -d $VENV_PATH ]; then
        echo "🍰 it doesn't appear this project has been setup. Try running\n\`just setup\`"
    else
        echo "🍰 Serving..."
        source ${VENV_PATH}bin/activate
        fastapi dev api/main.py
    fi

## Run scraper
scrape:
    #!/usr/bin/env bash
    set -euxo pipefail
    cd {{justfile_directory()}}
    VENV_PATH="{{justfile_directory()}}/venv/"

    if [ ! -d $VENV_PATH ]; then
        echo "🍰 it doesn't appear this project has been setup. Try running\n\`just setup\`"
    elif [ ! -f {{justfile_directory()}}/gbbo.db ]; then
        echo "🍰 it doesn't appear the db hasn't been properly created. Try running\n\`just db\`"
    else
        echo "🍰 Scrapping..."
        source ${VENV_PATH}bin/activate
        python scraper/main.py
    fi
