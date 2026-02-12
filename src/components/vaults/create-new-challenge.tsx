import { useConnection } from "@/components/onchain/connection-context";
import { useProtocol } from "@/components/onchain/protocol-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSigner } from "@/components/wallet/wallet-context";
import { useCreateVaultMutation } from "@/hooks/vaults/use-create-vault-mutation";
import { useEnsureManagerRegistry } from "@/hooks/vaults/use-ensure-manager-registry";
import { Transaction } from "@/lib/solana/transaction";
import { revalidateCache } from "@/lib/vaults";
import {
  fetchManagerRegistry,
  fetchMaybeManagerRegistry,
  fetchMaybeVault,
  fetchVault,
  getInitializeManagerRegistryInstructionAsync,
  getInitializeVaultInstructionAsync,
} from "@/protocol/hyroProtocol";
import { POLICY_ALLOW_ANY_PROGRAM_ADDRESS } from "@/protocol/policyAllowAny";
import {
  ChallengeTemplateUpdateInsertDtoArgs,
  fetchChallengeTemplate,
  getCreateChallengeTemplateInstructionAsync,
  StageType,
} from "@/protocol/policyChallenges";
import { address, Instruction, Rpc, SolanaRpcApi } from "@solana/kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  
} from "@hyr0-xyz/react"

const USDC = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const ORACLE = address("F9nB3BKFkXpA6WzLkogUP4RHyvwXZGAh8PhHPPkDNAa");

export const CreateNewChallenge = () => {
  const stageId = useRef(Math.floor(Math.random() * 30000));
  const signer = useSigner();
  const protocol = useProtocol();
  const connection = useConnection();
  const queryClient = useQueryClient();

  const ensureManagerRegistryMut = useEnsureManagerRegistry();
  const createVaultMut = useCreateVaultMutation();

  const handleVaultCreation = useCallback(
    async ({
      seed,
      name,
      description,
    }: {
      seed: string;
      name: string;
      description: string;
    }) => {
      return createVaultMut.mutate({
        seed,
        name: "",
        description: "",
      });
    },
    [createVaultMut]
  );

  //   const ensureChallengeTemplateMut = useMutation({
  //     mutationKey: ["ensureChallengeTemplate"],
  //     mutationFn: async (stageId: number) => {
  //       const [challengeTemplateAccount] =
  //         await protocol.helpers.getChallengeTemplatePda(stageId);

  //       const found = await fetchMaybeManagerRegistry(
  //         connection.connection,
  //         challengeTemplateAccount
  //       );

  //       if (found.exists) {
  //         return found;
  //       }

  //       toast.warning("Challenge template not found, creating new one");

  //       if (!signer) throw new Error("Signer not found");

  //       const templateData = {
  //         stageSequence: 1,
  //         stageType: StageType.Evaluation,
  //         startingDeposit: 10000 * 10 ** 6,
  //         admin: ORACLE, // hardcoded oracle
  //         entranceCost: 100 * 10 ** 6,
  //         entranceTokenMint: USDC, // USDC
  //         minimumTradingDays: [3],
  //         dailyDrawdown: [100],
  //         maximumLoss: [200],
  //         profitTarget: [300],
  //         maxParticipants: [50],
  //         isActive: true,
  //       } as ChallengeTemplateUpdateInsertDtoArgs;

  //       const createChallengeTemplateIx =
  //         await getCreateChallengeTemplateInstructionAsync({
  //           stageId,
  //           dto: templateData,
  //           challengeTemplateAccount,
  //           signer,
  //         });

  //       const { status, signature } = await Transaction.send({
  //         rpc: connection.connection as Rpc<SolanaRpcApi>,
  //         subscription: connection.subscription,
  //         signer: signer,
  //         instructions: [createChallengeTemplateIx],
  //         simulation: {
  //           computeUnitLimit: 200000,
  //         },
  //       });

  //       console.log("status", status);

  //       toast.info("Challenge template creation status: " + status?.err);

  //       return fetchChallengeTemplate(
  //         connection.connection,
  //         challengeTemplateAccount
  //       );
  //     },
  //   });

  //   const ensureParentVaultMut = useMutation({
  //     mutationKey: ["ensureParentVault"],
  //     mutationFn: async (stageId: number) => {
  //       const [[parentVault]] = await protocol.helpers.getVaultPda(
  //         stageId.toString()
  //       );

  //       const existing = await fetchMaybeVault(
  //         connection.connection,
  //         parentVault
  //       );

  //       if (existing.exists) {
  //         return existing;
  //       }

  //       if (!signer) throw new Error("Signer not found");

  //       const ixs: Instruction[] = [];

  //       const createParentVaultIx = await getInitializeVaultInstructionAsync({
  //         signer,
  //         underlyingMint: USDC,
  //         seed: stageId.toString(),
  //         policyProgram: POLICY_ALLOW_ANY_PROGRAM_ADDRESS,
  //         name: "",
  //         description: "",
  //       });

  //       return Transaction.send({
  //         rpc: connection.connection as Rpc<SolanaRpcApi>,
  //         subscription: connection.subscription,
  //         signer: signer,
  //         instructions: ixs,
  //         simulation: {
  //           computeUnitLimit: 200000,
  //         },
  //       }).then(async (signature) => {
  //         return fetchVault(connection.connection, parentVault);
  //       });
  //     },
  //   });

  //   const handleVaultCreation = useMutation({
  //     onSuccess: async () => {
  //       await revalidateCache();
  //       await queryClient.invalidateQueries({ queryKey: ["vaults-list"] });
  //     },
  //     onError: (error) => {
  //       console.error("error", error);
  //     },
  //     mutationFn: async (seed: string) => {
  //       if (!signer) throw new Error("Signer not found");

  //       const managerRegistry = await ensureManagerRegistryMut.mutateAsync();
  //       if (!managerRegistry) throw new Error("Manager registry not found");

  //       const challengeTemplate = await ensureChallengeTemplateMut.mutateAsync(
  //         stageId
  //       );
  //       const challengeTemplateAccount = challengeTemplate.address;

  //       const parentVault = await ensureParentVaultMut.mutateAsync(stageId);

  //       toast.success("Challenge template: " + challengeTemplateAccount);

  //       const templateData = {
  //         stageSequence: 1,
  //         stageType: StageType.Evaluation,
  //         startingDeposit: 10000 * 10 ** 6,
  //         admin: ORACLE, // hardcoded oracle
  //         entranceCost: 100 * 10 ** 6,
  //         entranceTokenMint: USDC, // USDC
  //         minimumTradingDays: [3],
  //         dailyDrawdown: [100],
  //         maximumLoss: [200],
  //         profitTarget: [300],
  //         maxParticipants: [50],
  //         isActive: true,
  //       } as ChallengeTemplateUpdateInsertDtoArgs;

  //       const createChallengeTemplateIx =
  //         await getCreateChallengeTemplateInstructionAsync({
  //           stageId,
  //           dto: templateData,
  //           challengeTemplateAccount,
  //           signer,
  //         });

  //       const [challengeAccount] = await protocol.helpers.getChallengePda(
  //         signer.address,
  //         seed
  //       );

  //       const startingDeposit = BigInt(templateData.startingDeposit);
  //       const profitTargetAmount =
  //         (startingDeposit * BigInt(templateData.profitTarget[0])) / 10000n;
  //       const maximumLossAmount =
  //         (startingDeposit * BigInt(templateData.maximumLoss[0])) / 10000n;
  //       const dailyDrawdownLimitAmount =
  //         (startingDeposit * BigInt(templateData.dailyDrawdown[0])) / 10000n;

  //       const joinChallengeIx = await getJoinChallengeInstructionAsync({
  //         challengeTemplateAccount,
  //         challengeAccount,
  //         participant: signer,
  //         challengeId: seed,
  //         stageId: Number(stageId),
  //         stageSequence: 0,
  //         profitTarget: {
  //           target: [templateData.profitTarget[0]],
  //           targetAmount: [profitTargetAmount],
  //           achieved: [0],
  //           achievedAmount: [0n],
  //         },
  //         tradingDays: {
  //           required: [templateData.minimumTradingDays[0]],
  //           completed: [0],
  //           requirementsMet: false,
  //           remainingDays: [templateData.minimumTradingDays[0]],
  //         },
  //         maximumLoss: {
  //           maximumLossPercentage: [templateData.maximumLoss[0]],
  //           maximumLossAmount: [maximumLossAmount],
  //           currentLossAchieved: [0],
  //           currentLossAchievedAmount: [0n],
  //         },
  //         dailyDrawdown: {
  //           drawdownType: DrawdownType.Static,
  //           limitPercentage: [templateData.dailyDrawdown[0]],
  //           limitAmount: [dailyDrawdownLimitAmount],
  //           maxEquity: [0n],
  //           currentDrawdownPercentage: [0],
  //           currentDrawdownAmount: [0n],
  //           violationTriggered: false,
  //         },
  //         status: ChallengeStatus.Active,
  //         payout: 0n,
  //         createdAt: BigInt(Math.floor(Date.now() / 1000)),
  //       });

  //       const newVaultIx = await getIssueChildVaultInstructionAsync({
  //         admin: signer,
  //         seed: seed,
  //         parentVault: undefined,
  //         managerRegistry: undefined,
  //         managerProfile: undefined,
  //         childPolicy: undefined,
  //         manager: undefined,
  //         allocation: 0,
  //         managerFees: {
  //           performanceFeeRate: 0,
  //           managementFeeRate: 0,
  //           collectionFrequency: FeeCollectionFrequency.Monthly,
  //           highWaterMark: 0,
  //           feeRecipient: undefined,
  //         },
  //       });

  //       const setupManagerIx = await getRegisterManagerInstructionAsync({
  //         admin: signer,
  //         manager: challengeAccount,
  //         registry: managerRegistry.address,
  //         riskRating: RiskRating.Conservative,
  //       });

  //       const [managerProfile] = await protocol.helpers.getManagerProfilePda(
  //         challengeAccount
  //       );
  //       const verifyManagerIx = await getVerifyManagerInstruction({
  //         admin: signer,
  //         managerProfile: managerProfile,
  //         registry: managerRegistry.address,
  //         verificationStatus: VerificationStatus.Verified,
  //       });

  //       return Transaction.send({
  //         rpc: connection.connection as Rpc<SolanaRpcApi>,
  //         subscription: connection.subscription,
  //         signer: signer,
  //         instructions: [joinChallengeIx, setupManagerIx, verifyManagerIx],
  //         simulation: {
  //           computeUnitLimit: 200000,
  //         },
  //       }).catch(async (e) =>
  //         connection.connection
  //           .getTransaction(e.signature as Signature, {
  //             maxSupportedTransactionVersion: 0,
  //             encoding: "jsonParsed",
  //           })
  //           .send()
  //       );
  //     },
  //   });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create new vault</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new vault</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Create a new vault to start earning rewards.
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const seed = formData.get("seed") as string;
            const name = formData.get("name") as string;
            const description = formData.get("description") as string;
            console.log("seed", seed);
            console.log("name", name);
            console.log("description", description);

            handleVaultCreation({
              seed,
              name,
              description,
            });
          }}
        >
          <div className="space-y-2">
            <Label className="inline-block" htmlFor="seed">
              Vault seed
            </Label>
            <Input placeholder="Vault seed" name="seed" id="seed" />
          </div>
          <div className="space-y-2">
            <Label className="inline-block" htmlFor="name">
              Vault name
            </Label>
            <Input placeholder="Vault name" name="name" id="name" />
          </div>
          <div className="space-y-2">
            <Label className="inline-block" htmlFor="description">
              Vault description
            </Label>
            <Textarea placeholder="Vault description" name="description" />
          </div>
          <Button type="submit" disabled={createVaultMut.isPending}>
            {createVaultMut.isPending ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
