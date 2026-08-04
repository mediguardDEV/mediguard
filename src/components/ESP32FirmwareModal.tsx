import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Cpu,
  Bluetooth,
  Wifi,
  Key,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { UserSession } from '../types';

interface ESP32FirmwareModalProps {
  isOpen: boolean;
  user?: UserSession | null;
  onClose: () => void;
}

export const ESP32FirmwareModal: React.FC<ESP32FirmwareModalProps> = ({ isOpen, user, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'pinout' | 'code'>('guide');

  if (!isOpen) return null;

  const currentUserId = user?.email || user?.id || 'idg97664@gmail.com';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/mediguard_esp32.ino';
    link.download = 'mediguard_esp32.ino';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/mediguard_esp32.ino');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">MediGuard ESP32 Official Firmware</h2>
              <p className="text-xs text-slate-400">
                Bluetooth Provisioning • User ID Locking • Auto WiFi Sync • Keypad Hardware Unbind
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-sky-600 text-sky-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>Bluetooth & WiFi Provisioning</span>
          </button>

          <button
            onClick={() => setActiveTab('pinout')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'pinout'
                ? 'border-sky-600 text-sky-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Hardware Wiring Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'code'
                ? 'border-sky-600 text-sky-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>View Arduino Code (.INO)</span>
          </button>
        </div>

        {/* Modal Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Bound Account Warning */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-sm text-teal-950">Active Account ID Ownership Lock</p>
                  <p>
                    When provisioned via Bluetooth, your ESP32 device locks itself to your active user email:{' '}
                    <span className="font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                      {currentUserId}
                    </span>
                  </p>
                  <p className="text-[11px] text-teal-800">
                    Only data sent with this specific bound ID will be displayed in this web app dashboard.
                  </p>
                </div>
              </div>

              {/* Step 1: Bluetooth Provisioning */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                    1
                  </div>
                  <h3>Bluetooth Provisioning over Terminal / Phone</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Power up your ESP32 DevKit. If no WiFi credentials exist in memory, the OLED will display{' '}
                  <strong className="text-slate-900">BLUETOOTH PROVISION</strong> and start advertising as{' '}
                  <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-sky-800 font-bold">
                    MediGuard_Box_XXXX
                  </span>.
                </p>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-1">
                  <p className="text-teal-400 font-bold">// Send this string over Serial Bluetooth Terminal:</p>
                  <p className="text-amber-300 font-bold">
                    SSID:YourWiFiName,PASS:YourWiFiPassword,USER_ID:{currentUserId}
                  </p>
                </div>
              </div>

              {/* Step 2: Automatic WiFi Sync */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                    2
                  </div>
                  <h3>Automatic WiFi & Web Data Sync</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Once provisioned, ESP32 saves credentials to NVS memory, connects to WiFi, and posts real-time
                  telemetry every 10 seconds to <code className="bg-slate-200 px-1 rounded">/api/esp32/sync</code>.
                </p>
              </div>

              {/* Step 3: Hardware Unbinding / Reset */}
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 space-y-3 text-rose-900">
                <div className="flex items-center gap-2 font-black text-rose-950 text-sm">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                  <h3>How to Unbind or Remove Device from Account</h3>
                </div>
                <p className="text-xs leading-relaxed">
                  To unbind the physical MediGuard box or clear saved WiFi credentials, press Keypad button{' '}
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-rose-300 text-rose-800">
                    'D'
                  </span>{' '}
                  twice within 3 seconds.
                </p>
                <ul className="list-disc pl-5 text-xs space-y-1 text-rose-800">
                  <li>3 warning alert beeps sound on the Buzzer.</li>
                  <li>NVS memory is cleared and the User ID binding is completely wiped.</li>
                  <li>Device restarts back into Bluetooth Provisioning mode ready for a new owner!</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'pinout' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-slate-900 text-sm">Official Blueprint Pinout Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-black text-sky-800 text-xs uppercase tracking-wider">Display & Clock (I2C)</p>
                  <ul className="space-y-1 font-mono text-slate-700">
                    <li>OLED SSD1306 (128x64): SCL -&gt; D22, SDA -&gt; D21</li>
                    <li>RTC DS1307 Clock: SCL -&gt; D22, SDA -&gt; D21</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-black text-sky-800 text-xs uppercase tracking-wider">4x4 Keypad Matrix</p>
                  <ul className="space-y-1 font-mono text-slate-700">
                    <li>Rows R1-R4 -&gt; D13, D12, D14, D27</li>
                    <li>Cols C1-C4 -&gt; D26, D25, D33, D32</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-black text-sky-800 text-xs uppercase tracking-wider">4 Servo Compartments</p>
                  <ul className="space-y-1 font-mono text-slate-700">
                    <li>Morning Servo -&gt; Pin D2</li>
                    <li>Afternoon Servo -&gt; Pin D15</li>
                    <li>Evening Servo -&gt; Pin D5</li>
                    <li>Night Servo -&gt; Pin D23</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-black text-sky-800 text-xs uppercase tracking-wider">Indicators & Alarm</p>
                  <ul className="space-y-1 font-mono text-slate-700">
                    <li>Morning LED (Green) -&gt; Pin D16</li>
                    <li>Afternoon LED (Yellow) -&gt; Pin D17</li>
                    <li>Evening LED (Blue) -&gt; Pin D18</li>
                    <li>Night LED (Red) -&gt; Pin D19</li>
                    <li>Active Buzzer (5V) -&gt; Pin D4</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  Ready to flash in Arduino IDE with ESP32 board manager.
                </p>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-teal-300 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                <pre>
                  {`// MEDIGUARD ESP32 FIRMWARE (.INO)
// Bluetooth Provisioning, WiFi Telemetry & Keypad Reset
#include <WiFi.h>
#include <HTTPClient.h>
#include <BluetoothSerial.h>
#include <Preferences.h>
#include <Adafruit_SSD1306.h>

// Full .ino source code is embedded in /mediguard_esp32.ino
// Click "Download Official .INO File" below to download standard Arduino file.`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Wifi className="w-4 h-4 text-teal-600" />
            <span>Target Board: ESP32 DevKit V1 (38-pin)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Official mediguard_esp32.ino</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
