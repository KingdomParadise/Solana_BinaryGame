import './App.css';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from './logo';
import {  Navbar,Nav,Button, Col ,Row} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Left from './images/left.png';
import Right from './images/right.png';
import Vs from './images/vs.jpeg';


// import idl from './idl.json';
// import { Connection,  clusterApiUrl, PublicKey } from '@solana/web3.js';
// import { Program, Provider, web3 } from '@project-serum/anchor';

// const { SystemProgram, Keypair } = web3;

// // Create a keypair for the account that will hold the GIF data.
// let baseAccount = Keypair.generate();

// // Get our program's id from the IDL file.
// const programID = new PublicKey(idl.metadata.address);

// // Set our network to devnet.
// const network = clusterApiUrl('localhost');

// // Controls how we want to acknowledge when a transaction is "done".
// const opts = {
//   preflightCommitment: "processed"
// }

function App() {

  const [walletAddress, setWalletAddress] = useState(null);
  const [stale_bal, setSelectedStakeBalance] = useState(null);
  // const [balance, getWalletBalabce] = useState(null);

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
  };

  const renderNotConnectedContainer = () => (
    <Button variant="outline-success"
      onClick={connectWallet}
    >
      Connect  Wallet
    </Button>
  );

  const renderConnectedContainer = () => (
    <div className="wallet">
        <span>wallet: {walletAddress}</span>
        <p></p>
        <span>Balance: 150SOL</span>
    </div>
  );
  
  const ColoredLine = ({ color }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: 1
        }}
    />
  );
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
              <Col md={4}><img src={Left} alt="left" height="200"/></Col>
              <Col md={4}><img src={Vs} alt="vs" height="150" /></Col>
              <Col md={4}><img src={Right} alt="right" height="200" /></Col>
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
                <Button variant="outline-primary" onClick={() => setSelectedStakeBalance(0.50)} >Start Battle</Button>
              </Col>
              <Col md={2}></Col>
            </Row>
          </Container>
        </div>
    </div>
  );
}

export default App;
