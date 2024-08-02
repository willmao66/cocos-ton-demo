

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    connector: any;

    tonConnectUI: any;

    async start () {
        
        // init logic
        this.label.string = "";

        // let sdk = globalThis.TonConnectSDK
        // this.connector = new sdk.TonConnect({
        //     manifestUrl:'https://archero.ttgames.xyz/manifest/archero.json'
        // });

        // this.connector.restoreConnection();
       
        // const unsubscribe = this.connector.onStatusChange(
        //     wallet => {
        //         if(wallet) {
        //             const rawAddress = wallet.account.address;
        //             const address = sdk.toUserFriendlyAddress(rawAddress);
        //             this.label.string = address;
        //         } else {
        //             this.label.string = '';
        //         }
        //     } 
        // );

        const TON_CONNECT_UI = globalThis.TON_CONNECT_UI;
        this.tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl:'https://archero.ttgames.xyz/manifest/archero.json'
        });

       
        // console.log(this.tonConnectUI)
        // console.log(this.tonConnectUI.connected())
        
        this.tonConnectUI.onStatusChange(
            async wallet => {
                if(wallet) {
                    const rawAddress = wallet.account.address;
                    const address = TON_CONNECT_UI.toUserFriendlyAddress(rawAddress);
                    this.label.string = address;
                    console.log(address)

                    // 通过jetton minter地址 获取 jetton数量
                    const TonWeb = globalThis.TonWeb;
                    const tonweb = new TonWeb();
                    const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
                        address: "EQAzT8yexq918h0JocavIPJ5K2ZO9N4qObFRqDNzAEfEnkhn"
                    });
                    const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(address));
                    console.log(jettonWalletAddress.toString(true, true, true));
                    const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider, {
                        address: jettonWalletAddress
                    });
                   
                    try {
                        const jettonData = await jettonWallet.getData();
                        console.log(jettonData.balance.toString());

                    } catch(e) {
                        console.log('0')
                    }
    
                    // const txs = await tonweb.provider.getTransactions(address, 5);
                    // console.log(txs[0].out_msgs[0])
                } else {
                    this.label.string = '';
                }
            } 
        )

        // console.log(this.tonConnectUI.address)

        // const unsubscribe = this.tonConnectUI.onStatusChange(
        //     wallet => {
        //         if(wallet) {
        //             // const rawAddress = wallet.account.address;
        //             // const address = sdk.toUserFriendlyAddress(rawAddress);
        //             // this.label.string = address;
        //             console.log(wallet)
        //         } else {
        //             this.label.string = '';
        //         }
        //     } 
        // );

    }

    async onConnect() {
        // if(this.connector && !this.connector.connected) {
        //     const walletConnectionSource = {
        //         universalLink: "https://t.me/wallet?attach=wallet",
        //         bridgeUrl: "https://bridge.ton.space/bridge"
        //     }
            
        //     const link = this.connector.connect(walletConnectionSource);
        //     console.log(link);

        //     cc.sys.openURL(link);
        // }
        // 调用函数
        this.connectToWallet().catch(error => {
            console.error("Error connecting to wallet:", error);
        });
    }

    async connectToWallet() {
        await this.tonConnectUI.connectWallet();
        // 如果需要，可以对connectedWallet做一些事情
        // console.log(connectedWallet);
    }

    async onDisconnect() {
        // if(this.connector && this.connector.connected) {
        //     this.connector.disconnect();
        // }
        await this.tonConnectUI.disconnect();
    }

    async onPay() {
        return this.onTest();
    
        const TonWeb = globalThis.TonWeb;

        const amount = TonWeb.utils.toNano("0.1").toString();
        const jettonAmount = new TonWeb.utils.BN(100);
       
        let a = new TonWeb.boc.Cell();
        a.bits.writeUint(21, 32);
        a.bits.writeCoins(jettonAmount);
        a.bits.writeString("mint");
        const payload = TonWeb.utils.bytesToBase64(await a.toBoc());
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
            messages: [
                {
                    address: "EQD1MT70ZUd3P26N_QNpV9WCAQNUOaLO-N0mzZy9QQQM2au5",
                    amount: amount,
                    payload: payload
                },
            ]
        }
        
        try {
            const result = await this.tonConnectUI.sendTransaction(transaction);
            console.log(result)
        } catch (e) {
            const TON_CONNECT_UI = globalThis.TON_CONNECT_UI;
            if(e instanceof TON_CONNECT_UI.UserRejectsError) {
                console.log('user rejects')
            } else {
                console.log('unkown error')
            }
        }   
    }

    async onTest() {
        const TonWeb = globalThis.TonWeb;
        const amount = TonWeb.utils.toNano("0.03").toString();
        const forwardAmount = TonWeb.utils.toNano("0.015");
        const jettonAmount = new TonWeb.utils.BN(25);

        const address = this.label.string;
        const tonweb = new TonWeb();
        const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
            address: "EQAzT8yexq918h0JocavIPJ5K2ZO9N4qObFRqDNzAEfEnkhn"
        });
        const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(address));
        const to = jettonWalletAddress.toString(true, true, true);
        const coreAddress = new TonWeb.utils.Address("EQBQZw26fP-ZpWKU3U2An7R_hDJYmnsrUqZUWZ9AAPidZXVf");
        const myAddress = new TonWeb.utils.Address(address);
        
        let cell = new TonWeb.boc.Cell();
        cell.bits.writeUint(0xf8a7ea5, 32); // request_transfer op
        cell.bits.writeUint(0, 64);
        cell.bits.writeCoins(jettonAmount);
        cell.bits.writeAddress(coreAddress);
        cell.bits.writeAddress(myAddress);
        cell.bits.writeUint(0, 1);
        cell.bits.writeCoins(forwardAmount);
        cell.bits.writeUint(0, 1);
        const payload = TonWeb.utils.bytesToBase64(await cell.toBoc());
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
            messages: [
                {
                    address: to, //"EQAM4PCqWx3hgurBri2K0B5UrV9H5qKu8ZNA9HVtjDaqZZqV",
                    amount: amount,
                    payload: payload
                },
            ]
        }

        try {
            const result = await this.tonConnectUI.sendTransaction(transaction);
            console.log(result)
        } catch (e) {
            const TON_CONNECT_UI = globalThis.TON_CONNECT_UI;
            if(e instanceof TON_CONNECT_UI.UserRejectsError) {
                console.log('user rejects')
            } else {
                console.log('unkown error')
            }
        }   
    }
}
