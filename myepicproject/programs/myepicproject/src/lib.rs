use anchor_lang::prelude::*;
use anchor_lang::Account;


declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod myepicproject {
    
    use anchor_lang::solana_program::{program::invoke,program::invoke_signed, system_instruction::transfer};
    use super::*;

    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        Ok(())
    }

    pub fn place_bet(ctx: Context<SendSol>, pred: u8, str_stake_bal: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;

        //Build the struct.
        let pred: u8 = pred;
        let stake_bal: u64 = str_stake_bal.parse().unwrap();


        let bet_item = BetStruct {
            bool_winner: false,
            pred: pred,
            stake_bal: stake_bal,
            user_address: *ctx.accounts.from.to_account_info().key,
        };

        base_account.current_bet = bet_item;

        let transfer_amount = stake_bal as u64;

        if transfer_amount > 0 {
            let ix = &transfer(
                &ctx.accounts.from.key(),
                &ctx.accounts.to.key(),
                transfer_amount
            );
            invoke(
                &ix,
                &[
                    ctx.accounts.from.to_account_info(),
                    ctx.accounts.to.to_account_info()
                ],
                
            );
        }

        Ok(())
    }

    pub fn compare_bet(ctx: Context<CompareBet>, data: u8) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let random_number = data as u8;

        let p :&mut BetStruct = &mut base_account.current_bet;
        
        if p.pred == random_number {
            p.modify(true);
        } else {
            p.modify(false);
        }
        
        Ok(())
    }

    pub fn result_bet(ctx: Context<SendSol>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let p :&BetStruct = &base_account.current_bet;

        if p.bool_winner == true {
            let transfer_amount = 2 * p.stake_bal as u64;
            
            if transfer_amount > 0 {
                let ix = &transfer(
                    &ctx.accounts.from.key(),
                    &ctx.accounts.to.key(),
                    transfer_amount
                );
                invoke(
                    &ix,
                    &[
                        ctx.accounts.from.to_account_info(),
                        ctx.accounts.to.to_account_info()
                    ]
                );
            }
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct StartStuffOff<'info> {
    #[account(init, payer = user,  space = 9000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

#[derive(Accounts)]
pub struct SendSol<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    from: Signer<'info>,
    #[account(mut)]
    to: AccountInfo<'info>,
    system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct CompareBet<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}


#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct BetStruct {
    pub bool_winner: bool,
    pub stake_bal: u64,
    pub pred: u8,
    pub user_address: Pubkey,
}

impl BetStruct {
    fn modify(&mut self, item: bool) {
        self.bool_winner = item;
    }
}

// #[account(signer)]
#[account]
pub struct BaseAccount {
    pub current_bet: BetStruct,
}

#[account]
pub struct PoolWallet{
    pub balance: u64 
} 