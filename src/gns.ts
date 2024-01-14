import { BigInt } from '@graphprotocol/graph-ts'
import {
  TokensAdded as TokensAddedEvent,
  TokensPulled as TokensPulledEvent,
  TokensRemoved as TokensRemovedEvent,
} from '../generated/Billing/Billing'
import {
  SubgraphPublished as SubgraphPublishedEvent,
  SubgraphUpgraded as SubgraphUpgradedEvent,
  SubgraphVersionUpdated as SubgraphVersionUpdatedEvent,
} from '../generated/GNS/GNS'
import {
  Account as AccountEntity,
  Subgraph as SubgraphEntity,
} from '../generated/schema'

function createOrLoadAccount(id: string): AccountEntity {
  let account = AccountEntity.load(id)
  if (account === null) {
    account = new AccountEntity(id)
    account.billingBalance = BigInt.zero()
    account.queryFeesPaid = BigInt.zero()
  }
  return account
}

// Token Handlers

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

export function handleTokensPulled(event: TokensPulledEvent): void {
  let account = createOrLoadAccount(event.params.user.toHex())
  account.billingBalance = account.billingBalance.minus(event.params.amount)
  account.save()
}

export function handleTokensRemoved(event: TokensRemovedEvent): void {
  let account = createOrLoadAccount(event.params.from.toHex())
  account.billingBalance = account.billingBalance.minus(event.params.amount)
  account.save()
}

// Subgraph Handlers

export function handleSubgraphPublished(event: SubgraphPublishedEvent): void {
  let subgraph = SubgraphEntity.load(event.params.subgraphID.toHex())
  if (subgraph === null) {
    subgraph = new SubgraphEntity(event.params.subgraphID.toHex())
    subgraph.currentVersionHash = event.params.subgraphDeploymentID.toHex()
    let account = createOrLoadAccount(event.transaction.from.toHexString())
    subgraph.account = account.id
    subgraph.queryFees = BigInt.zero()
  }
  subgraph.save()
}

export function handleSubgraphUpgraded(event: SubgraphUpgradedEvent): void {
  let subgraph = SubgraphEntity.load(event.params.subgraphID.toHex())
  if (subgraph !== null) {
    subgraph.currentVersionHash = event.params.subgraphDeploymentID.toHex()
    subgraph.save()
  }
}

export function handleSubgraphVersionUpdated(
  event: SubgraphVersionUpdatedEvent,
): void {
  let subgraph = SubgraphEntity.load(event.params.subgraphID.toHex())
  if (subgraph !== null) {
    subgraph.currentVersionHash = event.params.subgraphDeploymentID.toHex()
    subgraph.save()
  }
}
