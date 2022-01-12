# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:
### `npm install`

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# How to deploy the Program

## install the solana env

 1. Installing Rust
    
    $ curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

 2. Installing Solana
   
    sh -c "$(curl -sSfL https://release.solana.com/v1.9.4/install)"

 3.  Install Node, NPM, and Mocha

    npm install -g mocha

 4. Install Anchor

    To install Anchor, go ahead an run:

        cargo install --git https://github.com/project-serum/anchor anchor-cli --locked

## Deploy the program to the devnet
   
  First, switch to devnet:

    solana config set --url devnet

  Once you do that, run:

    solana config get

  From here, we'll need to airdrop ourselves some SOL on the devnet

    solana airdrop 2

  Now, run:

    solana balance

  Changing up some variables.

  Now, we need to change some variables in Anchor.toml. This is where it gets a little tricky.
  In Anchor.toml, change [programs.localnet] to [programs.devnet].
  Then, change cluster = "localnet" to cluster = "devnet".
  
  Now, run:

    anchor build

  This will create a new build for us with a program id. We can access it by running:

    solana address -k target/deploy/myepicproject-keypair.json

  This will output your program id, copy it. 
  Now, go to lib.rs. You'll see this id at the top.

    declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

  Basically, it's an id initially generated by anchor init that specifies our program's id.

  we need to change this program id in declare_id! to the one output by solana address -k target/deploy/myepicproject-keypair.json

  Now, go to Anchor.toml and under [programs.devnet] you'll see something like myepicproject = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS". Go ahead and change this id to the same id output when you run solana address -k target/deploy/myepicproject-keypair.json.


  Finally, once you do all this we need to run the build command again:

    anchor build

  🚀 Deploy to devnet!

    anchor deploy

## set the admin wallet

    1. create an phantom wallet of admin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
   
    2. Copy the wallet public address and paste it into the env file

            poolWallet = ""

    3. To start the betting, please airdrop some sol into the admin wallet

## Making IDL file
    when you build the program, you can find the idl file in the myepicproject/target/idl
    please copy the content of idl json file and paste it into src/idl.json
    
