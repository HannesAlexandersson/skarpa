import * as Dialog from "@radix-ui/react-dialog";
import Button from "@/components/Button/Button";
import { WITHDRAWAL_CONSENT_TEXT } from "@/lib/booking-schema";

type WithdrawalConsentDialogProps = {
  open: boolean;
  accepted: boolean;
  pending: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function WithdrawalConsentDialog({ open, accepted, pending, onAcceptedChange, onCancel, onConfirm }: WithdrawalConsentDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="glass-strong fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-32px)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-line bg-background p-[clamp(22px,4vw,36px)] shadow-card focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          onEscapeKeyDown={(event) => { if (pending) event.preventDefault(); }}
        >
          <Dialog.Title className="card-title">Ångerrätt och tidig start</Dialog.Title>
          <Dialog.Description asChild>
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-muted-foreground">
              <p>
                Vid avtal som ingås på distans har du som privatkund som huvudregel 14 dagars ångerrätt enligt distansavtalslagen. För en tjänst räknas ångerfristen från den dag avtalet ingås.
              </p>
              <p>
                För att Skärpa ska kunna påbörja slipningen innan ångerfristen har löpt ut behöver du uttryckligen begära det. Om du ångrar dig innan tjänsten är helt utförd kan du behöva betala för den del som redan utförts.
              </p>
              <p>
                När tjänsten är helt utförd upphör ångerrätten endast om du i förväg har samtyckt till detta. Din rätt att reklamera fel i tjänsten påverkas inte.
              </p>
            </div>
          </Dialog.Description>
          <a href="/customerpolicy" target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-accent underline underline-offset-4">
            Läs mer i kundvillkoren
          </a>
          <label htmlFor="withdrawalConsent" className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-card p-4 text-sm font-medium leading-relaxed text-foreground">
            <input
              id="withdrawalConsent"
              type="checkbox"
              checked={accepted}
              disabled={pending}
              onChange={(event) => onAcceptedChange(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
              aria-describedby="withdrawal-consent-help"
            />
            <span>{WITHDRAWAL_CONSENT_TEXT}</span>
          </label>
          <p id="withdrawal-consent-help" className="ml-1 mt-2 text-xs text-muted-foreground">
            Du måste markera samtycket för att slutföra bokningen.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onCancel} disabled={pending}>Tillbaka</Button>
            <Button variant="accent" onClick={onConfirm} disabled={!accepted || pending} aria-busy={pending}>
              {pending ? "Sparar bokning…" : "Bekräfta och boka"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
