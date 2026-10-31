import React from "react";
import { Button, Form, Modal, Badge } from "react-bootstrap";
import { useIntiface, ConnectionStatus } from "src/hooks/IntifaceContext";
import { DEFAULT_DEVICE_SYNC_SHORTCUT, deviceSyncShortcut } from "src/utils/deviceSyncShortcut";
import { DEFAULT_SYNC_TIMING } from "src/utils/funscriptScheduler";

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
  return <Badge variant={bg}>{label}</Badge>;
}

export const IntifaceModal: React.FC<IProps> = ({ show, onHide }) => {
  const {
    enabled, setEnabled,
    wsUrl, setWsUrl,
    status, errorMessage,
    linearDevices,
    connect, disconnect,
    updatesSuspended, toggleUpdates,
    updateShortcut, setUpdateShortcut,
    syncTiming, setSyncTiming,
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

        <Form.Group controlId="intiface-update-shortcut" className="mb-3">
          <Form.Label>Stop / resume updates shortcut</Form.Label>
          <Form.Control
            type="text"
            readOnly
            value={updateShortcut}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Tab") return;
              event.preventDefault();
              event.stopPropagation();
              if (event.repeat || event.nativeEvent.isComposing) return;
              const shortcut = deviceSyncShortcut(event);
              if (shortcut) setUpdateShortcut(shortcut);
            }}
          />
          <Form.Text muted>
            Focus this field and press a key combination to assign it. This
            shortcut takes priority over page shortcuts while connected and is
            ignored in text fields. Tab moves focus.
          </Form.Text>
          <Button
            size="sm"
            variant="outline-secondary"
            className="mt-2"
            onClick={() => setUpdateShortcut(DEFAULT_DEVICE_SYNC_SHORTCUT)}
          >
            Reset to Page Down
          </Button>
        </Form.Group>

        {enabled && (
          <>
            <Form.Group controlId="intiface-sync-interval" className="mb-3">
              <Form.Label>Scheduler interval (ms)</Form.Label>
              <Form.Control
                as="select"
                value={syncTiming.intervalMs}
                onChange={(e) => setSyncTiming({ ...syncTiming, intervalMs: Number(e.currentTarget.value) })}
              >
                {Array.from(new Set([10, 20, 25, 50, 100, syncTiming.intervalMs])).sort((a, b) => a - b).map((ms) => (
                  <option key={ms} value={ms}>{ms} ms</option>
                ))}
              </Form.Control>
              <Form.Text muted>
                Checks playback timing at this interval. Sends one command per
                target, not every check. Smaller values improve timing precision;
                browser throttling can still delay updates.
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="intiface-sync-offset" className="mb-3">
              <Form.Label>Script offset (ms): {syncTiming.offsetMs}</Form.Label>
              <Form.Control
                type="range"
                min={-1000}
                max={1000}
                step={10}
                value={syncTiming.offsetMs}
                onChange={(e) => setSyncTiming({ ...syncTiming, offsetMs: Number(e.currentTarget.value) })}
              />
              <Form.Text muted>
                Positive runs the script ahead of audio; negative delays it.
              </Form.Text>
              <Button size="sm" variant="outline-secondary" className="mt-2" onClick={() => setSyncTiming(DEFAULT_SYNC_TIMING)}>
                Reset timing
              </Button>
            </Form.Group>
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
              <div className="mb-3">
                <Button
                  variant={updatesSuspended ? "warning" : "outline-danger"}
                  onClick={toggleUpdates}
                  aria-pressed={updatesSuspended}
                >
                  {updatesSuspended ? "Resume updates" : "Stop updates"}
                </Button>
                <p className="small mt-2 mb-0" role="status">
                  {updatesSuspended
                    ? "Device updates stopped. Audio playback continues."
                    : "Device updates allowed."}
                </p>
              </div>
            )}
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
