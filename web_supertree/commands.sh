


django-admin startproject supertree
python manage.py startapp accounts
python manage.py createsuperuser

python manage.py sqlmigrate app 0001
python manage.py makemigrations
python manage.py migrate
python manage.py migrate
python manage.py shell
python manage.py flush

source ~/.virtualenvs/djangodev/bin/activate

#activate debug email
python -m smtpd -n -c DebuggingServer localhost:1025


#Image
sudo apt install linuxbrew-wrapper
brew install libtiff libjpeg webp little-cms2
pip install Pillow

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

install this font for fix bad font-rendering on visual code
libfreetype6_2.8-0.2ubuntu2_amd64.deb