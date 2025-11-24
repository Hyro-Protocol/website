# Validation System

The HYRO Protocol validation system provides a unified approach for policy programs to validate vault operations. The system uses a single `validate` function with operation-specific contexts, enabling flexible and extensible validation logic across different policy types.

## Validation Architecture

**Unified Validation Function**
All policy programs implement a single `validate` function that accepts a `ValidateOperation` parameter. This approach simplifies policy implementation while providing operation-specific validation capabilities.

**Operation Types**
The validation system supports four distinct operations:
- **Creation**: Validates transaction creation requests
- **Execution**: Validates transaction execution requests
- **UseFunds**: Validates fund usage operations
- **ReturnFunds**: Validates fund return operations

## Validation Context System

**Context Mapping**
The `get_context` function maps each operation type to a specific validation context that provides operation-specific account access:

```rust
pub fn get_context(operation: ValidateOperation) -> ValidateContext {
    match operation {
        ValidateOperation::Creation => ValidateContext::Creation(CreationContext { ... }),
        ValidateOperation::Execution => ValidateContext::Execution(ExecutionContext { ... }),
        ValidateOperation::UseFunds => ValidateContext::UseFunds(UseFundsContext { ... }),
        ValidateOperation::ReturnFunds => ValidateContext::ReturnFunds(ReturnFundsContext { ... }),
    }
}
```

**Context Types**
Each context provides helper methods to access accounts from `remaining_accounts`:
- **CreationContext**: Access to transaction, policy account, signer, and vault signer
- **ExecutionContext**: Access to transaction, policy account, signer, and vault signer
- **UseFundsContext**: Access to policy account
- **ReturnFundsContext**: Access to policy account

## Policy Implementation Pattern

**Standard Validation Pattern**
Policy programs implement validation using a consistent pattern:

```rust
pub fn validate(ctx: Context<Validate>, operation: ValidateOperation) -> Result<()> {
    let validate_ctx = get_context(operation);
    match validate_ctx {
        ValidateContext::Creation(creation_ctx) => {
            creation_ctx.validate_accounts(ctx.remaining_accounts)?;
            // Policy-specific creation validation
            Ok(())
        }
        ValidateContext::Execution(execution_ctx) => {
            execution_ctx.validate_accounts(ctx.remaining_accounts)?;
            // Policy-specific execution validation
            Ok(())
        }
        ValidateContext::UseFunds(use_funds_ctx) => {
            use_funds_ctx.validate_accounts(ctx.remaining_accounts)?;
            // Policy-specific use funds validation
            Ok(())
        }
        ValidateContext::ReturnFunds(return_funds_ctx) => {
            return_funds_ctx.validate_accounts(ctx.remaining_accounts)?;
            // Policy-specific return funds validation
            Ok(())
        }
    }
}
```

**Account Validation**
Each context provides a `validate_accounts` method that ensures all required accounts are present in `remaining_accounts` before policy-specific validation logic executes.

## Operation-Specific Validation

**Creation Operation**
The Creation operation validates transaction creation requests:
- Validates required accounts are present
- Verifies policy account matches expected PDA
- Performs policy-specific creation checks
- Used when creating new transaction proposals

**Execution Operation**
The Execution operation validates transaction execution requests:
- Validates required accounts are present
- Verifies policy account matches expected PDA
- Validates transaction signer authorization
- Performs policy-specific execution checks
- Used when executing approved transactions

**UseFunds Operation**
The UseFunds operation validates fund usage:
- Validates policy account is present
- Performs policy-specific fund usage checks
- Used when funds are allocated or spent

**ReturnFunds Operation**
The ReturnFunds operation validates fund returns:
- Validates policy account is present
- Performs policy-specific fund return checks
- Used when funds are returned to the vault

## Context Helper Methods

**CreationContext and ExecutionContext**
Both contexts provide methods to access accounts:
- `transaction()`: Returns transaction account and deserialized transaction data
- `policy_account()`: Returns policy account reference
- `signer()`: Returns signer account reference
- `vault_signer()`: Returns vault signer account reference

**UseFundsContext and ReturnFundsContext**
These contexts provide:
- `validate_accounts()`: Ensures policy account is present

## Policy Examples

**Owners Policy**
The Owners policy validates that transaction signers are authorized owners:

```rust
ValidateContext::Execution(execution_ctx) => {
    execution_ctx.validate_accounts(ctx.remaining_accounts)?;
    let policy_account = execution_ctx.policy_account(ctx.remaining_accounts);
    let sender = execution_ctx.signer(ctx.remaining_accounts);
    
    let policy = Owners::try_deserialize(&mut &policy_account.data.borrow()[..])?;
    require!(policy.owners.contains(&sender.key()), ErrorCode::UnauthorizedSender);
    Ok(())
}
```

**Multisig Policy**
The Multisig policy validates transaction signatures and approval thresholds:

```rust
ValidateContext::Creation(creation_ctx) => {
    creation_ctx.validate_accounts(ctx.remaining_accounts)?;
    let policy_account = creation_ctx.policy_account(ctx.remaining_accounts);
    let sender = creation_ctx.signer(ctx.remaining_accounts);
    
    let mut multisig = MultiSig::try_deserialize(&mut &policy_account.data.borrow()[..])?;
    // Check owner and mark signature
    Ok(())
}
```

## Integration with Vault System

**Vault Validation Flow**
When vaults perform operations, they invoke the associated policy program's `validate` function:

1. Vault prepares operation-specific accounts
2. Vault calls policy program's `validate` function with appropriate operation
3. Policy program validates the operation using context helpers
4. Validation result determines whether operation proceeds

**Transaction Creation**
During transaction creation, vaults call:
```rust
ValidateOperation::Creation
```

**Transaction Execution**
During transaction execution, vaults call:
```rust
ValidateOperation::Execution
```

## Error Handling

**Validation Errors**
The validation system provides specific error codes:
- `MissingTransaction`: Required transaction account not found
- `MissingPolicyAccount`: Required policy account not found
- `MissingSigner`: Required signer account not found
- `MissingVaultSigner`: Required vault signer account not found
- `InvalidAccountData`: Account data format is invalid

**Policy-Specific Errors**
Policy programs define additional error codes for policy-specific validation failures, such as unauthorized access or invalid parameters.

## Security Considerations

**Account Validation**
The context system ensures all required accounts are present before policy-specific validation, preventing runtime errors from missing accounts.

**PDA Verification**
Policies verify that policy accounts match expected PDAs derived from vault addresses, ensuring correct policy association.

**Authorization Checks**
Execution operations validate signer authorization, ensuring only authorized parties can execute transactions.

The validation system provides a robust, extensible framework for policy-based transaction validation while maintaining simplicity and consistency across different policy implementations.

