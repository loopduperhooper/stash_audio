import React from "react";
import { Button, Form, Modal, Badge } from "react-bootstrap";
import { useIntiface, ConnectionStatus } from "src/hooks/IntifaceContext";

interface IProps {
  show: boolean;
  onHide: () => void;
}

function statusBadge(status: ConnectionStatus): React.ReactElement {
  const map: Record<ConnectionStatus, { bg: string; label: string }> = {
    disconnected: { bg: "secondary", label: "Disconnected" },
    connecting:   { bg: "warning",   label: "Connecting…"  },
    connected:    { bg: "success",   label: "Connected"    },
    error:        { bg: "danger",    label: "Error"        },
  };
  const { bg, label } = map[status];
  return <Badge bg={bg}>{label}</Badge>;
}

export const IntifaceModal: React.FC<IProps> = ({ show, onHide }) => {
  const {
    enabled, setEnabled,
    wsUrl, setWsUrl,
    status, errorMessage,
    linearDevices,
    connect, disconnect,
  } = useIntiface();

  const isConnected = status === "connected";
  const isBusy = status === "connecting";

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Intiface / Buttplug Device Sync</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Enable/Disable toggle */}
        <Form.Group className="mb-3 d-flex align-items-center gap-3">
          <Form.Label className="mb-0 fw-bold">Device sync</Form.Label>
          <Form.Check
            type="switch"
            id="intiface-enabled"
            label={enabled ? "Enabled" : "Disabled"}
            checked={enabled}
            onChange={(e) => setEnabled(e.currentTarget.checked)}
          />
        </Form.Group>

        {enabled && (
          <>
            {/* WS URL */}
            <Form.Group className="mb-3">
              <Form.Label>Intiface Central WebSocket URL</Form.Label>
              <Form.Control
                type="text"
                value={wsUrl}
                disabled={isConnected || isBusy}
                onChange={(e) => setWsUrl(e.currentTarget.value)}
                placeholder="ws://localhost:12345"
              />
            </Form.Group>

            {/* Status row */}
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="fw-bold">Status:</span>
              {statusBadge(status)}
              {isConnected ? (
                <Button size="sm" variant="danger" onClick={disconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={connect} disabled={isBusy}>
                  {isBusy ? "Connecting…" : "Connect"}
                </Button>
              )}
            </div>

            {/* Error */}
            {status === "error" && errorMessage && (
              <p className="text-danger small mb-3">{errorMessage}</p>
            )}

            {/* Device list */}
            {isConnected && (
              <div>
                <p className="fw-bold mb-1">
                  Linear devices ({linearDevices.length})
                </p>
                {linearDevices.length === 0 ? (
                  <p className="text-muted small">No linear devices connected. Check Intiface Central.</p>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {linearDevices.map((d) => (
                      <li key={d.index} className="small">
                        #{d.index} — {d.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};
