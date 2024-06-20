import TonConnect from '@tonconnect/sdk';
import { toUserFriendlyAddress } from '@tonconnect/sdk';
// import {
//     isWalletInfoCurrentlyEmbedded,
//     isWalletInfoInjectable,
//     isWalletInfoCurrentlyInjected,
//     isWalletInfoRemote,
//     WalletInfo
// } from '@tonconnect/sdk';
import { isWalletInfoCurrentlyEmbedded, WalletInfoCurrentlyEmbedded } from '@tonconnect/sdk';


const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    connector: TonConnect;

    // tonConnectUI: TonConnectUI;

    async start () {
        // init logic
        this.label.string = "";

        this.connector = new TonConnect({
            manifestUrl:'https://archero.ttgames.xyz/manifest/archero.json'
        });

        this.connector.restoreConnection();
       
        const unsubscribe = this.connector.onStatusChange(
            wallet => {
                if(wallet) {
                    const rawAddress = wallet.account.address;
                    const address = toUserFriendlyAddress(rawAddress);
                    this.label.string = address;
                } else {
                    this.label.string = '';
                }
            } 
        );
    }

    async onConnect() {
        if(this.connector && !this.connector.connected) {
            const walletConnectionSource = {
                universalLink: "https://t.me/wallet?attach=wallet",
                bridgeUrl: "https://bridge.ton.space/bridge"
            }
            
            const link = this.connector.connect(walletConnectionSource);
            console.log(link);

            cc.sys.openURL(link);
        }
    }

    async onDisconnect() {
        if(this.connector && this.connector.connected) {
            this.connector.disconnect();
        }
    }
}
