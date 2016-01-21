## Build:

1:  sudo apt-get update
    sudo apt-get install nodejs
    sudo apt-get install npm
2:  sudo npm install -g bower grunt-cli
    sudo ln -s /usr/bin/nodejs /usr/bin/node
    cd {project-root}/
    sudo bower --allow-root install bower.json
    bower install bower.json
    npm install -g fis
    npm install -g fis-postpackager-simple
3:  config nginx to point to ${project-root}/app
server {
        listen 80;
        server_name 52.5.48.109;
 
        location / {
                root /home/kunchen/git/ad-ui/web-build;
        }
}

server {
        listen 5000;
 
        location / {
                include uwsgi_params;
                uwsgi_pass unix:/home/kunchen/git_be/ads/ads.sock;
        }
}
    
4:  #package and deploy by  FIS
  cd {project-root}/app
  fis release -o --dest ../web-build --pack    

5:  Open "http://127.0.0.1/" in browser
6:  sudo ufw stop ( if necessary)
7:  release ip restriction ( if necessary)


Enable JShint check(JS syntax) & CSS coding style check  
1. sudo npm install -g jshint    
2. sudo npm install -g csslint    
3. cd .git/hooks    
4. ln -s ../../git_hook/pre-commit.
5. chmod +x pre-commit  
Note: the pre-commit uses the lints at /opt/local/bin/jshint, /opt/local/bin/csslint   
You can create a softlink if your machine did not install it at this position  

Sample commit error message you will get  
app/scripts/config.router.ui.js: line 1, col 1, Use the function form of "use strict".  
app/scripts/config.router.ui.js: line 51, col 38, Missing semicolon.  
