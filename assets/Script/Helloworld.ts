

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
            wallet => {
                if(wallet) {
                    const rawAddress = wallet.account.address;
                    const address = TON_CONNECT_UI.toUserFriendlyAddress(rawAddress);
                    this.label.string = address;
                } else {
                    this.label.string = '';
                }
            } 
        )

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
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
            messages: [
                {
                    address: "UQCUbjXYCDTsEI5C2NOQc-yc6YhIatNfoOpKbuhToraGYVza",
                    amount: "10000000",
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
