"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Plus,
  Filter,
  ShieldCheck,
  Flag,
  LogIn,
  House,
  Package,
  Truck,
  MountainSnow,
  TriangleAlert,
  MessageSquareDot,
} from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedback?: () => void;
}

export function HelpDialog({ open, onOpenChange, onFeedback }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Como usar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section className="space-y-1.5">
            <div className="flex items-center gap-2 font-medium">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              Encontrar pontos de ajuda
            </div>
            <p className="text-muted-foreground pl-6">
              Navegue pelo mapa e clique nos marcadores para ver detalhes como
              endereço, telefone, horário e necessidades de cada ponto.
            </p>
          </section>

          <section className="space-y-1.5">
            <div className="flex items-center gap-2 font-medium">
              <Filter className="h-4 w-4 text-primary shrink-0" />
              Filtrar por tipo ou cidade
            </div>
            <p className="text-muted-foreground pl-6">
              Use os filtros para encontrar abrigos, pontos de coleta ou
              distribuição. Selecione uma cidade para ver só os locais de lá.
            </p>
          </section>

          <section className="space-y-1.5">
            <div className="flex items-center gap-2 font-medium">
              <LogIn className="h-4 w-4 text-primary shrink-0" />
              Entrar com e-mail
            </div>
            <p className="text-muted-foreground pl-6">
              Para cadastrar pontos, confirmar ou denunciar, você precisa estar
              logado. Crie uma conta gratuita com e-mail e senha.
            </p>
          </section>

          <section className="space-y-1.5">
            <div className="flex items-center gap-2 font-medium">
              <Plus className="h-4 w-4 text-primary shrink-0" />
              Cadastrar um ponto
            </div>
            <p className="text-muted-foreground pl-6">
              Clique em "Novo Ponto", preencha nome, tipo, endereço e as
              necessidades do local. Limite de 3 pontos por dia.
            </p>
          </section>

          <section className="space-y-1.5">
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
              Confirmar um local
            </div>
            <p className="text-muted-foreground pl-6">
              Esteve no local e ele existe e funciona? Toque em{" "}
              <strong>"Confirmo que existe"</strong> para ajudar outras pessoas
              a confiar na informação.
            </p>
          </section>

          <section className="space-y-1.5">
            <div className="flex items-center gap-2 font-medium">
              <Flag className="h-4 w-4 text-red-500 shrink-0" />
              Denunciar um local
            </div>
            <p className="text-muted-foreground pl-6">
              Informação errada ou local fechado? Toque em{" "}
              <strong>"Denunciar"</strong> e escreva o motivo (ex:{" "}
              <em>"Endereço errado"</em>, <em>"Local fechado"</em>). Isso ajuda
              a manter o mapa correto.
            </p>
          </section>

          <div className="border-t pt-3">
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Tipos de ponto
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col items-center gap-1 rounded-md border p-2">
                <House className="h-4 w-4 text-blue-500" />
                <span>Abrigo</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md border p-2">
                <Package className="h-4 w-4 text-green-500" />
                <span>Coleta</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md border p-2">
                <Truck className="h-4 w-4 text-orange-500" />
                <span>Distribuição</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md border p-2">
                <MountainSnow className="h-4 w-4 text-amber-700" />
                <span>Deslizamento</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-md border p-2">
                <TriangleAlert className="h-4 w-4 text-red-600" />
                <span>Soterramento</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
            <p>
              Ao usar esta plataforma, você concorda com nossos{" "}
              <Link href="/termos" className="underline hover:text-foreground" target="_blank">
                Termos de Uso
              </Link>{" "}
              e nossa{" "}
              <Link href="/privacidade" className="underline hover:text-foreground" target="_blank">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>

        <DialogClose asChild>
          <Button className="w-full mt-2">Entendi</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
