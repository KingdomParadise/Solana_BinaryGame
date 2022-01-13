import './App.css';
import React, {  useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from './logo';
import {  Navbar,Nav,Button, Col ,Row} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Left from './images/left.png';
import Right from './images/right.png';
import Vs from './images/vs.jpeg';
import kp from './keypair.json'

import idl from './idl.json';
import { Connection,  clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

const { SystemProgram, Keypair, LAMPORTS_PER_SOL } = web3;

// Create a keypair for the account that will hold the betting data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const poolWallet = web3.Keypair.fromSecretKey(secret);

window.Buffer = window.Buffer || require('buffer').Buffer;

let baseAccount = Keypair.generate();
// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

function App() {

  const [walletAddress, setWalletAddress] = useState(null);
  const [stake_bal, setSelectedStakeBalance] = useState(null);
  const [balance, getWalletBalance] = useState(null);
  const [pred, setPrediction] = useState(null);
  const [boolBaseAccount, setBaseAccount] = useState(false);
  //check if the phantom wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
  
      if (solana) {
        if (solana.isPhantom) {

          const response = await solana.connect();
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    await checkIfWalletIsConnected();
    //get the balance of user's wallet
    // await createBetAccount();
    await getBalance();
  };

  const getBalance = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = getProvider();
    const publicKey = provider.wallet.publicKey;
    const balanceOfwallet = await connection.getBalance(publicKey);
    getWalletBalance(balanceOfwallet / LAMPORTS_PER_SOL);
  }

  const createBetAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      setBaseAccount(true);

      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString());
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error);
    }
  }

  const renderNotConnectedContainer = () => (
    <Button variant="outline-success"
      onClick={connectWallet}
    >
      Connect  Wallet
    </Button>
  );
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, window.solana, opts.preflightCommitment,);
    return provider;
  }

  const placeBet = async () => {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    //setting the betting value
    console.log(poolWallet.publicKey.toString());
    await program.rpc.placeBet(pred,(stake_bal * LAMPORTS_PER_SOL).toString(), {
        accounts: {
            baseAccount:baseAccount.publicKey,
            from: provider.wallet.publicKey,
            // to: poolWalletPubickey,
            to: poolWallet.publicKey,
            systemProgram: SystemProgram.programId,
        },
    });

    await getBalance();

    const min = 0;
    const max = 1;
    let rand = min + Math.random() * (max - min);
    // it needs to update in the future 
    if (rand<=0.5){
        rand = 0;
    } else {
        rand = 1;
    }
    console.log("rand->",rand);
    console.log("pred->",pred);
    //generating the random number and sending to the program
    let tx = await program.rpc.compareBet(rand, {
        accounts: {
          baseAccount:baseAccount.publicKey,
        },
    });
    console.log(tx);

    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log(account.currentBet);
    //result of the bet and fixing this part now
    // let tx2 = await program.rpc.resultBet({
    // accounts: {
    //     baseAccount:baseAccount.publicKey,
    //     from: poolWallet.publicKey,
    //     to: provider.wallet.publicKey,
    //     systemProgram: SystemProgram.programId,
    // },
    // signers:  [poolWallet],
    // });

    // console.log(tx2);

    await getBalance();

  }

  const renderConnectedContainer = () => {
    if (boolBaseAccount === false) {
      return (
        <div className="connected-container">
          <button variant="outline-danger" onClick={createBetAccount}>
            Do One-Time Initialization For Bet Program Account
          </button>
        </div>
      )
    } else {
      return (
        <div className="wallet">
        <span>wallet: {walletAddress}</span>
        <p></p>
        <span>Balance: {balance}SOL</span>
    </div>
      )
    }
  }
  
  const ColoredLine = ({ color }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: 1
        }}
    />
  );

  const imageClick = (pred) => {
    setPrediction(pred);
  }

  return (
    <div>
      <Navbar variant="light" expand="lg" sticky="top">
            <Container>
                <Navbar.Brand ><Logo/></Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav className="me-auto my-2 my-lg-0"
                         style={{ maxHeight: '100px' }}
                         navbarScroll
                    >
                        <Nav.Link href="/">Home</Nav.Link>
                        <Nav.Link href="/">Roadmap</Nav.Link>
                        <Nav.Link href="/">Arena</Nav.Link>
                    </Nav>
                    {!walletAddress && renderNotConnectedContainer()}
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <ColoredLine color="black" />
        {walletAddress && renderConnectedContainer()}
        <Container className="block">
          <Row>
            <Col md={4}> <hr /></Col>
            <Col md={4} className="text"><span>Zankoku Arena</span></Col>
            <Col md={4}><hr/></Col>
          </Row>
        </Container>
        <div className='bet'>
          <Container>
            <Row>
              <Col md={4}><img src={Left} alt="left" height="200" onClick={() => imageClick(0)}/></Col>
              <Col md={4}><img src={Vs} alt="vs" height="150" /></Col>
              <Col md={4}><img src={Right} alt="right" height="200" onClick={() => imageClick(1)}/></Col>
            </Row>
            <Row>
              <Col md={2}></Col>
              <Col md={8}>
                <Row>
                  <Col md={4}>
                    <Button  variant="outline-success" onClick={() => setSelectedStakeBalance(0.05)} >0.05 SOL</Button>
                  </Col>
                  <Col md={4}>
                    <Button variant="outline-success" onClick={() => setSelectedStakeBalance(0.10)} >0.10 SOL</Button>
                  </Col>
                  <Col md={4}>
                    <Button variant="outline-success" onClick={() => setSelectedStakeBalance(0.25)} >0.25 SOL</Button>
                  </Col>
                </Row>
                <br></br>
                <Row>
                  <Col md={4}>
                    <Button variant="outline-success" onClick={() => setSelectedStakeBalance(0.50)} >0.50 SOL</Button>
                  </Col>
                  <Col md={4}>
                    <Button variant="outline-success" onClick={() => setSelectedStakeBalance(1)} >1.00SOL</Button>
                  </Col>
                  <Col md={4}>
                    <Button variant="outline-success" onClick={() => setSelectedStakeBalance(2)} >2.00SOL</Button>
                  </Col>
                </Row>
                <hr/>
                <Button variant="outline-primary" onClick={() => placeBet()} >Start Battle</Button>
              </Col>
              <Col md={2}></Col>
            </Row>
          </Container>
        </div>
    </div>
  );
}

export default App;