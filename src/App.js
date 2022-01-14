import './App.css';
import React, {  useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from './logo';
import {  Navbar,Nav,Button, Col ,Row} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Left from './images/left.png';
import Right from './images/right.png';
import Vs from './images/vs.jpeg';
import kp from './keypair.json';
import admin_kp from './Adminkeypair.json';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import idl from './idl.json';
import { Connection,  clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
require('dotenv').config();


const { SystemProgram, Keypair, LAMPORTS_PER_SOL } = web3;

// Create a keypair for the account that will hold the betting data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = Keypair.fromSecretKey(secret);

const admin_arr = Object.values(admin_kp._keypair.secretKey);
const admin_secret = new Uint8Array(admin_arr);
const adminAccount = web3.Keypair.fromSecretKey(admin_secret);


window.Buffer = window.Buffer || require('buffer').Buffer;

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

function App() {

  const [walletAddress, setWalletAddress] = useState(null); // address of user
  const [poolWalletAddress, setPoolWalletAddress] = useState(null);  //address of poolWallet
  const [stake_bal, setSelectedStakeBalance] = useState(null); // sol amount that the user bets
  const [balance, getWalletBalance] = useState(null); // total sol amount of user's wallet
  const [pool_bal,getPoolWalletBalance] = useState(null); // total sol amount of poolWallet
  const [pred, setPrediction] = useState(null); // predection that user bets
  const [claimFunds, setClaimFunds] = useState(1);
  //check if the phantom wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
  
      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect();
          setWalletAddress(response.publicKey.toString());
          setPoolWalletAddress(adminAccount.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    console.log(adminAccount.publicKey.toString());
    console.log(baseAccount.publicKey.toString());
    await checkIfWalletIsConnected();
    await getBalance();
    // const provider = getProvider();
    // const program = new Program(idl, programID, provider);
    
    // await program.rpc.startStuffOff({
    //   accounts: {
    //     baseAccount: baseAccount.publicKey,
    //     user: provider.wallet.publicKey,
    //     systemProgram: SystemProgram.programId,
    //   },
    //   signers: [baseAccount],
    // });
    //get the balance of user's wallet
  };

  const getBalance = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = getProvider();
    const publicKey = provider.wallet.publicKey;
    const balanceOfwallet = await connection.getBalance(publicKey);
    getWalletBalance(balanceOfwallet / LAMPORTS_PER_SOL);
    const balanceOfadminwallet = await connection.getBalance(adminAccount.publicKey);
    getPoolWalletBalance(balanceOfadminwallet/ LAMPORTS_PER_SOL);
  }


  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(connection, window.solana, opts.preflightCommitment,);
    return provider;
  }

  const placeBet = async () => {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);


    if(pred==null || stake_bal == null ){
      alert("please select the image and stake_balance both :)");
      return
    }
    
    //setting the betting value
    let placeBet = await program.rpc.placeBet(pred,(stake_bal * LAMPORTS_PER_SOL).toString(), {
        accounts: {
            baseAccount:baseAccount.publicKey,
            from: provider.wallet.publicKey,
            to: adminAccount.publicKey,
            systemProgram: SystemProgram.programId,
        },
    });
    setPrediction(null);
    setSelectedStakeBalance(null);
    await getBalance();
    console.log("place bet->",placeBet);
    

    const min = 0;
    const max = 1;
    let rand = min + Math.random() * (max - min);

    if (rand<=0.5){
        rand = 0;
    } else {
        rand = 1;
    }
    // generating the random number and sending to the program
    let compareBet = await program.rpc.compareBet(rand, {
        accounts: {
          baseAccount:baseAccount.publicKey,
        },
    });
    console.log("compare bet->",compareBet);

    let resultBet = await program.rpc.resultBet({
    accounts: {
        baseAccount:baseAccount.publicKey,
        from: adminAccount.publicKey,
        to: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
    },
    signers:  [adminAccount],
    });

    await getBalance();
    console.log("result bet->",resultBet);
    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);  
    console.log("bet vec->", account.currentBet.boolWinner);
    if (account.currentBet.boolWinner===true){
      alert("Win");
    } else {
      alert("fail");
    }

  }

  const renderNotConnectedContainer = () => (
    <Button variant="outline-success"
      onClick={connectWallet}
    >
      Connect  Wallet
    </Button>
  );
  


  const depositfund = async () => {
    //Todo withdrawfund
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    await program.rpc.claimDepositFund((claimFunds * LAMPORTS_PER_SOL).toString(),{
      accounts: {
          baseAccount:baseAccount.publicKey,
          from: provider.wallet.publicKey,
          to: adminAccount.publicKey,
          systemProgram: SystemProgram.programId,
      },
    });
    setClaimFunds(0);
    getBalance();
    alert("success");
  }

  const claimfund = async () => {
    //Todo withdrawfund
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    await program.rpc.claimDepositFund((claimFunds * LAMPORTS_PER_SOL).toString(),{
      accounts: {
          baseAccount:baseAccount.publicKey,
          from: adminAccount.publicKey,
          to: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
      },
      signers: [adminAccount],
    });
    setClaimFunds(0); 
    getBalance();
    alert("success");
  }

  const renderConnectedContainer =  () => {
    const provider = getProvider();
    if ('25vD2PRXZwozg4ySP1sX3WTSwLkasdJ4eosNPk1zi38V' !== provider.wallet.publicKey.toString()){
      return (
        <Container>
          <Row>
            <Col md={4}>
              <div className="wallet">
                  <span>wallet: {walletAddress}</span>
                  <p></p>
                  <span>Balance: {balance}SOL</span>
              </div>
            </Col>
            <Col md={4}/>
            <Col md={4}>
              <div className="poolwallet">
                  <span>Platform: {poolWalletAddress}</span>
                  <p></p>
                  <span>Balance: {pool_bal}SOL</span>
              </div>
            </Col>
          </Row>
        </Container>
      );
    } else {
      return(
        <Container>
          <Row>
            <Col md={4}>
              <div className="wallet">
                  <span>Platform: {poolWalletAddress}</span>
                  <p></p>
                  <span>Balance: {pool_bal}SOL</span>
              </div>
            </Col>  
            <Col md={4}/>
            <Col md={4}>
              <div className="poolwallet">
                  <span>Amount: <input type="text"  value = {claimFunds} onChange = {(e) => setClaimFunds(e.target.value)}/></span>
                  <p></p>
                  <Button variant="outline-success"  onClick={() => depositfund()}>Deposit funds</Button>
                  <Button variant="outline-success"  onClick={() => claimfund()}>Claim funds</Button>
              </div>
            </Col>
          </Row>
          </Container>
      );
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