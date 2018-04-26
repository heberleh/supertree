

# last used sequency

# installing pip and vistualenv
sudo apt install -y python3-pip
sudo pip3 install virtualenv

# creating virtual env and activate current session
cd Documents/Projects/supertree
virtualenv env
. env/bin/activate
> add the line:       env/*        > to the .gitignore file from /supertree/.gitignore
> git add .gitignore
> commit and push

# after activated, install libraries
sudo apt install python-qt4  # necessary global library

# Image manipulation... 
sudo apt install linuxbrew-wrapper
brew install sip --with-python3
brew install pyqt --with-python3
brew install libtiff libjpeg webp little-cms2  # necessary global library -> run it twice
pip3 install Pillow

sudo apt-get install python3-tk

pip3 install networkx

pip3 install django

# brew install sip --with-python3
# brew install pyqt --with-python3
# ln -s /usr/local/Cellar/sip/4.19.8_2/lib/python3.6/site-packages/*.* ./env/lib/python3.6/site-packages/
# ln -s /usr/local/Cellar/pyqt/5.10.1/lib/python3.6/site-packages/PyQt4/*.* ./env/lib/python3.6/site-packages/PyQt4

pip install PySide

pip3 install numpy lxml six # ete dependencies
pip3 install --upgrade ete3



python manage.py runserver # if already configured

. ../env/bin/activate


# --------------------------------------------------------------------------
# //// VISUAL CODE
pip install pylint
-> select python enviroment with cntrl + shift + p
install python set of tools in the extentions menu from visual code...

# //// activate debug email
python -m smtpd -n -c DebuggingServer localhost:1025

# /// DJANGO COMMANDS
django-admin startproject supertree
python manage.py startapp accounts
python manage.py createsuperuser

python manage.py sqlmigrate app 0001
python manage.py makemigrations
python manage.py migrate
python manage.py migrate
python manage.py shell
python manage.py flush

#  OTHERS ////////////////////////////////////////////

source ~/.virtualenvs/djangodev/bin/activate

pip install pylint
-> select python enviroment with cntrl + shift + p
install python set of tools in the extentions menu from visual code...

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

install this font for fix bad font-rendering on visual code
libfreetype6_2.8-0.2ubuntu2_amd64.deb


{
    "python.venvFolders": [
        "envs",
        ".pyenv",
        ".direnv",
        "${workspaceFolder}/../env",
        "${workspaceFolder}/env"
    ],
    "python.linting.pylintArgs": [
        "--load-plugins=pylint_django"
    ],
}