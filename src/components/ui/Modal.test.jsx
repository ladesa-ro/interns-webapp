import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";

function ModalDeTeste({ onClose = () => {} }) {
  return (
    <Modal open onClose={onClose} title="Excluir empresa">
      <button type="button">Primeiro</button>
      <button type="button">Último</button>
    </Modal>
  );
}

describe("Modal", () => {
  it("expõe o papel de diálogo e é rotulado pelo título", () => {
    render(<ModalDeTeste />);

    const dialogo = screen.getByRole("dialog", { name: "Excluir empresa" });
    expect(dialogo).toHaveAttribute("aria-modal", "true");
  });

  it("move o foco para o primeiro elemento focável ao abrir", () => {
    render(<ModalDeTeste />);
    expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus();
  });

  it("fecha com Escape", async () => {
    const aoFechar = vi.fn();
    render(<ModalDeTeste onClose={aoFechar} />);

    await userEvent.keyboard("{Escape}");
    expect(aoFechar).toHaveBeenCalledTimes(1);
  });

  it("mantém o foco preso dentro do diálogo", async () => {
    render(<ModalDeTeste />);

    const fechar = screen.getByRole("button", { name: "Fechar" });
    const ultimo = screen.getByRole("button", { name: "Último" });

    await userEvent.tab({ shift: true });
    expect(ultimo).toHaveFocus();

    await userEvent.tab();
    expect(fechar).toHaveFocus();
  });

  it("trava o scroll do body enquanto está aberto", () => {
    const { unmount } = render(<ModalDeTeste />);
    expect(document.body.dataset.scrollLocked).toBe("true");

    unmount();
    expect(document.body.dataset.scrollLocked).toBeUndefined();
  });

  it("não renderiza nada quando fechado", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Oculto">
        conteúdo
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("ConfirmDialog", () => {
  it("separa as ações de confirmar e cancelar", async () => {
    const aoConfirmar = vi.fn();
    const aoCancelar = vi.fn();

    render(
      <ConfirmDialog
        open
        onConfirm={aoConfirmar}
        onCancel={aoCancelar}
        title="Excluir vaga"
        description="Esta ação não pode ser desfeita."
        tone="danger"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(aoConfirmar).toHaveBeenCalledTimes(1);
    expect(aoCancelar).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(aoCancelar).toHaveBeenCalledTimes(1);
  });

  it("desabilita as ações enquanto processa", () => {
    render(
      <ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} loading />
    );

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /carregando/i })).toBeDisabled();
  });
});
