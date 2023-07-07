# How to make a change

## Node js

Currently, GitHub Actions allows to run js action on node v16,
therefore make sure that you can run your changes on that version of NodeJs

## Making changes

### Sources
Source files are written in Typescript and can be fund in `src/` directory

### Build

⚠️ To make your changes runnable as GitHub Action source files must be 
- first compiled by Typescript compiler
- then package it (aggregate it) into single `dist/index.js` file

To make it easier you can just run a command:
```bash 
yarn all
```

Which will:
- compile
- apply prettier
- lint
- package
- test


### Contributing
After making change in production code please remember to:

1. Add/Update unit tests 
2. run `yarn all`
3. commit
4. push to separate branch
5. create PR


