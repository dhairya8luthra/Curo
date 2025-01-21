
import { useState } from 'react';
import './Modal.css'; // Assuming you have a CSS file for styling

interface ModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (title: string) => void;
}

export default function Modal({ show, onClose, onSave }: ModalProps) {
    const [title, setTitle] = useState('');

    const handleSave = () => {
        if (title.trim()) {
            onSave(title);
            setTitle(''); // Clear the title field
        }
    };


    return (
        show && (
            <div className="modal-overlay">
                <div className="modal">
                    <h2>Add Appointment</h2>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter appointment title"
                        className="modal-input"
                    />
                    <div className="modal-actions">
                        <button onClick={onClose} className="modal-button cancel">Cancel</button>
                        <button onClick={handleSave} className="modal-button save">Save</button>
                    </div>
                </div>
            </div>
        )
    );
}
