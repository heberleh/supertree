



 python manage.py sqlmigrate app 0001
 python manage.py makemigrations
 python manage.py migrate
 python manage.py migrate


 source ~/.virtualenvs/djangodev/bin/activate
# alterar eviroment para virtualenvs.... 
# adicionar essa path pra virtualenvs na config... como mostra abaixo

# user config
{
    "window.zoomLevel": 1,
    "git.enableSmartCommit": true,
    "editor.renderControlCharacters": true,
    "editor.wordWrapColumn": 100,
    "editor.wordWrap": "wordWrapColumn",
    "python.venvFolders": [
        "envs",
        ".pyenv",
        ".direnv",
        ".virtualenvs",
        "~/.virtualenvs"  #  <----
    ],
    "python.linting.pylintArgs": [
        "--load-plugins=pylint_django"   #<----
    ],
}

pip install pylint..... etc
