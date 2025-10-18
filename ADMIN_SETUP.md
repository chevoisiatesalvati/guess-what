# Admin Setup Guide

## Multi-Admin System

The admin system now supports multiple admins with proper management capabilities:

### 1. **Admin Types**
- **Contract Owner**: Has full privileges (can add/remove admins, create games)
- **Admins**: Can create games but cannot manage other admins
- **Dynamic Management**: Admins can be added/removed by the contract owner

### 2. **Accessing the Admin Panel**

#### Option A: From the Home Page
1. Connect your wallet (must be an admin or contract owner)
2. The "👑 Admin Panel" button will automatically appear
3. Click the button to access `/admin`

#### Option B: Direct URL Access
1. Navigate directly to `/admin`
2. Connect your wallet
3. The system will verify you're an admin or contract owner
4. If you have admin privileges, you'll see the admin interface
5. If not, you'll see an "Access Denied" message

### 3. **Admin Features**
- **Create Games**: Set up new games with custom words and prize pools
- **Prize Pool Management**: Assign initial prize pools to games
- **Real-time Preview**: See how the game will look to players
- **Transaction Management**: Pay ETH for prize pools when creating games
- **Admin Management**: Add/remove admins (contract owner only)

### 4. **How to Become Admin**

#### Method 1: Deploy the Contract
- Deploy the `GuessWhatGame.sol` contract with your address
- You'll automatically become the owner with full admin privileges

#### Method 2: Be Added as Admin
- The contract owner can add you as an admin using the admin management panel
- Navigate to `/admin/manage` to add/remove admins

#### Method 3: Initialize with Multiple Admins
- When deploying, pass an array of admin addresses to the constructor
- All specified addresses will become admins immediately

### 5. **Environment Variables (Optional)**
You can still set `NEXT_PUBLIC_ADMIN_ADDRESS` in your `.env.local` file for additional checks, but it's not required since the system now checks contract ownership dynamically.

### 6. **Admin Panel Features**

#### Main Admin Panel (`/admin`)
- **Game Creation Form**: 
  - Top word, middle word, bottom word
  - Entry fee (0.001 - 0.1 ETH)
  - Initial prize pool (admin pays this)
- **Real-time Preview**: See how the game looks to players
- **Success/Error Handling**: Clear feedback on game creation
- **Admin Status**: Shows loading while checking admin privileges

#### Admin Management Panel (`/admin/manage`)
- **Add Admins**: Contract owner can add new admin addresses
- **Remove Admins**: Contract owner can remove existing admins
- **View Admin List**: See all current admins
- **Admin Count**: Track total number of admins

### 7. **Security Notes**
- Only admins or contract owner can create games
- Only contract owner can add/remove admins
- Admin privileges are checked on every page load
- No hardcoded admin addresses
- Dynamic admin verification from blockchain
- Contract owner cannot be removed as admin

### 8. **Troubleshooting**

#### "Access Denied" Error
- Make sure you're connected with a wallet that is an admin or contract owner
- Check that you're on the correct network (Base Sepolia for testing)
- Verify the contract is deployed and you have admin privileges

#### "Checking Admin Status" Loading Forever
- Check your network connection
- Ensure the contract is properly deployed
- Try refreshing the page

#### Admin Panel Button Not Showing
- Make sure you're connected with the owner wallet
- Check the browser console for any errors
- Verify the contract is deployed and accessible

### 9. **Testing the Admin System**
1. Deploy the contract with your wallet (you become the owner)
2. Connect the same wallet to the frontend
3. Navigate to the home page
4. You should see the "👑 Admin Panel" button
5. Click it to access the admin interface
6. Create a test game with a small prize pool
7. Test the admin management by adding/removing admins
8. Test the game flow as a player

### 10. **Contract Deployment with Multiple Admins**
```solidity
// Example deployment with multiple initial admins
address[] memory initialAdmins = new address[](2);
initialAdmins[0] = 0x1234...; // First admin address
initialAdmins[1] = 0x5678...; // Second admin address

GuessWhatGame game = new GuessWhatGame(ownerAddress, initialAdmins);
```

This system is now fully dynamic with multi-admin support and doesn't require any environment variable configuration for admin access!
