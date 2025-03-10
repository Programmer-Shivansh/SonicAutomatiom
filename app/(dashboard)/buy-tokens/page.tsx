import TokenPurchase from "@/components/TokenPurchase";

export default function BuyTokensPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Buy Sonic Tokens</h1>
      <p className="text-muted-foreground">
        Purchase Sonic tokens directly from your wallet. Connect your wallet to get started.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Why buy Sonic Tokens?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="font-medium">Access to the Sonic ecosystem</p>
                <p className="text-sm text-muted-foreground">Use Sonic tokens across multiple dApps in our ecosystem</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="font-medium">Low transaction fees</p>
                <p className="text-sm text-muted-foreground">Experience lightning-fast transactions with minimal fees</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="font-medium">Secure and transparent</p>
                <p className="text-sm text-muted-foreground">All transactions are securely recorded on the Sonic blockchain</p>
              </div>
            </li>
          </ul>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">How it works</h2>
            <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
              <li>Connect your MetaMask wallet</li>
              <li>Enter the amount of Sonic tokens you want to buy</li>
              <li>Confirm the transaction in your wallet</li>
              <li>Receive your tokens instantly</li>
            </ol>
          </div>
        </div>
        
        <div>
          <TokenPurchase />
        </div>
      </div>
    </div>
  );
} 