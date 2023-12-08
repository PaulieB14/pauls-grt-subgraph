import { BigInt } from "@graphprotocol/graph-ts";
import {
  TokensAdded as TokensAddedEvent,
  TokensRemoved as TokensRemovedEvent,
  TokensPulled as TokensPulledEvent,
} from "../generated/Billing/Billing";
import { Account } from "../generated/schema";

// Helper functions to create or load an Account
function createOrLoadAccount(id: string): Account {
  let account = Account.load(id);
  if (account == null) {
    account = new Account(id);
    account.billingBalance = BigInt.zero();
    account.queryFeesPaid = account.queryFeesPaid = BigInt.zero();
    // Initialize other necessary fields
  }
  return account;
}

export function handleTokensAdded(event: TokensAddedEvent): void {
  let account = createOrLoadAccount(event.params.user.toHex());
  account.billingBalance = account.billingBalance.plus(event.params.amount);
  account.save();
  // Additional logic for transactions or daily data
}

export function handleTokensRemoved(event: TokensRemovedEvent): void {
  let account = createOrLoadAccount(event.params.from.toHex());
  account.billingBalance = account.billingBalance.minus(event.params.amount);
  account.save();
  // Additional logic for transactions or daily data
}

export function handleTokensPulled(event: TokensPulledEvent): void {
  let account = createOrLoadAccount(event.params.user.toHex());
  account.billingBalance = account.billingBalance.minus(event.params.amount);
  account.save();
  // Additional logic for transactions or daily data
}

// Additional handlers for other events
