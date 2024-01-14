import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import {
  TokensAdded as TokensAddedEvent,
  TokensRemoved as TokensRemovedEvent,
  TokensPulled as TokensPulledEvent,
} from '../generated/Billing/Billing'
import { Account, Subgraph, Transaction } from '../generated/schema'

// Helper function to create or load an Account
function createOrLoadAccount(id: string): Account {
  let account = Account.load(id)
  if (account == null) {
    account = new Account(id)
    account.billingBalance = BigInt.zero()
    account.queryFeesPaid = BigInt.zero()
    // Initialize other necessary fields
  }
  return account
}

// Handle tokens being added to an account
export function handleTokensAdded(event: TokensAddedEvent): void {
  let account = createOrLoadAccount(event.params.user.toHex())

  // Consistent calculation of query fees (e.g., 10% of added tokens)
  let queryFeeAmount = event.params.amount
    .times(BigInt.fromI32(10)) // 10%
    .div(BigInt.fromI32(100)) // to get the percentage

  account.billingBalance = account.billingBalance.plus(event.params.amount)
  account.queryFeesPaid = account.queryFeesPaid.plus(queryFeeAmount)
  account.save()
}

// Handle tokens being removed from an account
export function handleTokensRemoved(event: TokensRemovedEvent): void {
  let account = createOrLoadAccount(event.params.from.toHex())
  account.billingBalance = account.billingBalance.minus(event.params.amount)
  account.save()
}

// Handle tokens being pulled from an account
export function handleTokensPulled(event: TokensPulledEvent): void {
  let account = createOrLoadAccount(event.params.user.toHex())
  account.billingBalance = account.billingBalance.minus(event.params.amount)
  account.save()
}

// Additional handlers for other events
