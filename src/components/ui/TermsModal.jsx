// src/components/ui/TermsModal.jsx

import Modal from './Modal'
import Button from './Button'

const TermsModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Términos y Condiciones">
    <div className="overflow-y-auto max-h-72 text-sm text-slate-300 space-y-4 pr-1">
      <p>
        Al registrarte en <strong className="text-white">CuidaTuWallet</strong>, aceptás los
        siguientes términos de uso de la aplicación.
      </p>
      <h3 className="text-white font-semibold">1. Uso de la aplicación</h3>
      <p>
        CuidaTuWallet es una herramienta de gestión financiera personal. No somos una entidad
        financiera ni proveemos servicios bancarios. La información ingresada es de uso exclusivamente
        personal y no será compartida con terceros.
      </p>
      <h3 className="text-white font-semibold">2. Privacidad de datos</h3>
      <p>
        Los datos que ingresás (ingresos, gastos, tarjetas) se almacenan de forma segura en
        Firebase Firestore y solo son accesibles por vos mediante tu cuenta autenticada.
      </p>
      <h3 className="text-white font-semibold">3. Responsabilidad</h3>
      <p>
        CuidaTuWallet no se responsabiliza por decisiones financieras tomadas en base a la
        información mostrada en la app. La información ingresada depende exclusivamente del usuario.
      </p>
      <h3 className="text-white font-semibold">4. Modificaciones</h3>
      <p>
        Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos
        ante cambios relevantes.
      </p>
    </div>
    <div className="mt-5">
      <Button onClick={onClose} className="w-full">Entendido</Button>
    </div>
  </Modal>
)

export default TermsModal
