### INITIALIZATION/COLONING
__git clone__: to clone a remote repo into a local directory

__git init__: Creates new git repository

### BRANCHING
__git checkout <branch_name>__: Go to <branch_name>

__git checkout -b feature/branch-name__: creates new branch and navigates to that branch

__git branch <branch_name>__: makes new branch, does not navigate

__git branch__: shows name of current branch

__git branch -a__: List all branches

### REMOTE REPO
__git fetch origin__: downloads all files from remote repository

__git pull origin main__:  downloads all files and immediately merges them

__git status__: displays current state of working branch

__git remote add origin https://github.com/<repo_name>__: add remote repo

### "COMMIT" FLOW
#### 1. Check status 
__git status__: Prints changes, uncommited/unadded code, etc...

#### 2. Update to origin code: Prevents merge conflicts
__git pull origin__: Pulls origin code from remote repo of current branch 

#### 3. Stage all new files
__git add . or git add <file_name>__: selects files to add to “cart” for pushing (. adds all, <file_name> adds specified files)

#### 4. Commit files locally
__git commit -m “message”__: Saves staged files locally

#### 5. Push to remote repo
__git push -u origin <branch_name>__:  Pushes branch to GitHub

#### Pull request
See github website