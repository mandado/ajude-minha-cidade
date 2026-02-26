"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Bug, Heart, MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { submitFeedback, type FeedbackType } from "@/lib/actions/feedback";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEEDBACK_TYPES: {
  value: FeedbackType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeClass: string;
}[] = [
  {
    value: "suggestion",
    label: "Sugestão",
    icon: Lightbulb,
    color: "text-amber-500",
    activeClass: "bg-amber-50 border-amber-400 text-amber-700",
  },
  {
    value: "bug",
    label: "Bug",
    icon: Bug,
    color: "text-red-500",
    activeClass: "bg-red-50 border-red-400 text-red-700",
  },
  {
    value: "praise",
    label: "Elogio",
    icon: Heart,
    color: "text-pink-500",
    activeClass: "bg-pink-50 border-pink-400 text-pink-700",
  },
  {
    value: "other",
    label: "Outro",
    icon: MessageSquare,
    color: "text-muted-foreground",
    activeClass: "bg-accent border-border text-foreground",
  },
];

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = (value: boolean) => {
    if (!value) {
      // Reset ao fechar
      setTimeout(() => {
        setMessage("");
        setType("suggestion");
        setSubmitted(false);
      }, 300);
    }
    onOpenChange(value);
  };

  const handleSubmit = async () => {
    if (message.trim().length < 10) {
      toast.error("Escreva pelo menos 10 caracteres.");
      return;
    }
    setIsPending(true);
    const result = await submitFeedback({ type, message });
    setIsPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-12 text-green-500" />
            <div>
              <h3 className="font-semibold text-lg">Obrigado pelo feedback!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sua mensagem foi recebida e vai nos ajudar a melhorar a plataforma.
              </p>
            </div>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enviar feedback</DialogTitle>
              <DialogDescription>
                Tem uma ideia, achou um bug ou quer compartilhar algo? Fale com a gente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Tipo de feedback */}
              <div>
                <p className="text-sm font-medium mb-2">Tipo</p>
                <div className="grid grid-cols-4 gap-2">
                  {FEEDBACK_TYPES.map(({ value, label, icon: Icon, color, activeClass }) => (
                    <button
                      key={value}
                      onClick={() => setType(value)}
                      className={`flex flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 text-xs font-medium transition-colors ${
                        type === value ? activeClass : "hover:bg-accent"
                      }`}
                    >
                      <Icon className={`size-4 ${type === value ? "" : color}`} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <p className="text-sm font-medium mb-2">Mensagem</p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === "suggestion"
                      ? "Ex: seria ótimo poder filtrar por bairro..."
                      : type === "bug"
                        ? "Ex: ao clicar em X, acontece Y..."
                        : type === "praise"
                          ? "Ex: o app ajudou muito durante..."
                          : "O que você tem em mente?"
                  }
                  rows={4}
                  maxLength={1000}
                  className="resize-none"
                />
                <div className="flex justify-between mt-1">
                  {message.trim().length > 0 && message.trim().length < 10 ? (
                    <p className="text-xs text-destructive">
                      Mínimo de 10 caracteres ({10 - message.trim().length} restantes)
                    </p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {message.length}/1000
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isPending || message.trim().length < 10}
              >
                {isPending ? "Enviando..." : "Enviar feedback"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
