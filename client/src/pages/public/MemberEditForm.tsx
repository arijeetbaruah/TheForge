import React from 'react';
import {ArtisanTool, Member, OtherTool, ToolProficiency} from '../../types/member';
import _ from "underscore";

interface MemberEditFormProps {
    member: Member;
    onSave: (updated: Member) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

interface MemberEditFormState {
    form: Member;
    errors: Partial<Record<keyof Member, string>>;
}

const ALL_TOOLS: ToolProficiency[] = [
    ...Object.values(ArtisanTool),
    ...Object.values(OtherTool)
];

const STATS: Array<{ key: keyof Member; label: string; abbr: string }> = [
    { key: 'STR', label: 'Strength',     abbr: 'STR' },
    { key: 'DEX', label: 'Dexterity',    abbr: 'DEX' },
    { key: 'INT', label: 'Intelligence', abbr: 'INT' },
    { key: 'WIS', label: 'Wisdom',       abbr: 'WIS' },
    { key: 'CHA', label: 'Charisma',     abbr: 'CHA' },
];

function modifier(score: number): string {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

class MemberEditForm extends React.Component<MemberEditFormProps, MemberEditFormState> {
    constructor(props: MemberEditFormProps) {
        super(props);
        this.state = {
            form: { ...props.member },
            errors: {},
        };

        this.handleMultiSelectChange = this.handleMultiSelectChange.bind(this);
    }

    private handleTextChange = (field: keyof Member, value: string) => {
        this.setState(prev => ({
            form: { ...prev.form, [field]: value },
            errors: { ...prev.errors, [field]: undefined },
        }));
    };

    private handleStatChange = (field: keyof Member, value: string) => {
        const num = parseInt(value, 10);
        const clamped = isNaN(num) ? 0 : Math.min(30, Math.max(1, num));
        this.setState(prev => ({
            form: { ...prev.form, [field]: clamped },
            errors: { ...prev.errors, [field]: undefined },
        }));
    };

    private validate(): boolean {
        const { form } = this.state;
        const errors: Partial<Record<keyof Member, string>> = {};

        if (!form.Name.trim()) errors.Name = 'Name is required.';
        STATS.forEach(({ key }) => {
            const val = form[key] as number;
            if (val < 1 || val > 30) errors[key] = '1–30';
        });

        this.setState({ errors });
        return Object.keys(errors).length === 0;
    }

    private handleSubmit = () => {
        if (this.validate()) {
            this.props.onSave(this.state.form);
        }
    };

    private handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.options)
            .filter(o => o.selected)
            .map(o => o.value)
            .join(',');
        this.setState(prev => ({
            form: { ...prev.form, Tools: selected },
            errors: { ...prev.errors, Tools: undefined },
        }));
    };

    render() {
        const { onCancel, isSaving } = this.props;
        const { form, errors } = this.state;

        return (
            <>
                <style>{`
                    .mef-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(15, 10, 5, 0.72);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 200;
                        padding: 1rem;
                    }

                    .mef-sheet {
                        background: #f5edd6;
                        border: 2px solid #8b6914;
                        border-radius: 4px;
                        box-shadow: 0 8px 40px rgba(0,0,0,0.55), inset 0 0 60px rgba(139,105,20,0.08);
                        width: 100%;
                        max-width: 500px;
                        max-height: 90vh;
                        overflow-y: auto;
                        font-family: 'Georgia', 'Times New Roman', serif;
                        color: #2c1a06;
                    }

                    .mef-header {
                        background: #2c1a06;
                        color: #f5edd6;
                        padding: 0.85rem 1.5rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .mef-title {
                        font-size: 1rem;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        margin: 0;
                        font-weight: normal;
                    }

                    .mef-close {
                        background: none;
                        border: none;
                        color: #c9a84c;
                        font-size: 1.4rem;
                        cursor: pointer;
                        line-height: 1;
                        padding: 0;
                    }
                    .mef-close:hover { color: #f5edd6; }

                    .mef-body {
                        padding: 1.5rem;
                    }

                    .mef-divider {
                        border: none;
                        border-top: 1px solid #c9a84c;
                        margin: 1.25rem 0;
                        opacity: 0.5;
                    }

                    .mef-field {
                        margin-bottom: 1rem;
                    }

                    .mef-label {
                        display: block;
                        font-size: 0.7rem;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        color: #6b4c11;
                        margin-bottom: 0.3rem;
                    }

                    .mef-input {
                        width: 100%;
                        box-sizing: border-box;
                        background: rgba(255,255,255,0.55);
                        border: 1px solid #b8920a;
                        border-radius: 3px;
                        padding: 0.5rem 0.65rem;
                        font-family: inherit;
                        font-size: 0.95rem;
                        color: #2c1a06;
                        outline: none;
                        transition: border-color 0.15s, box-shadow 0.15s;
                    }
                    .mef-input:focus {
                        border-color: #8b6914;
                        box-shadow: 0 0 0 2px rgba(139,105,20,0.2);
                    }
                    .mef-input.mef-error {
                        border-color: #b03a2e;
                    }

                    .mef-error-msg {
                        font-size: 0.72rem;
                        color: #b03a2e;
                        margin-top: 0.2rem;
                        font-style: italic;
                    }

                    .mef-section-label {
                        font-size: 0.7rem;
                        letter-spacing: 0.14em;
                        text-transform: uppercase;
                        color: #6b4c11;
                        text-align: center;
                        margin-bottom: 0.85rem;
                    }

                    .mef-stats-grid {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 0.65rem;
                    }

                    .mef-stat-box {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        background: rgba(255,255,255,0.4);
                        border: 1px solid #c9a84c;
                        border-radius: 3px;
                        padding: 0.5rem 0.25rem 0.4rem;
                    }

                    .mef-stat-abbr {
                        font-size: 0.62rem;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: #6b4c11;
                        margin-bottom: 0.25rem;
                    }

                    .mef-stat-input {
                        width: 48px;
                        text-align: center;
                        background: rgba(255,255,255,0.6);
                        border: 1px solid #b8920a;
                        border-radius: 3px;
                        padding: 0.3rem 0.1rem;
                        font-family: inherit;
                        font-size: 1.1rem;
                        font-weight: bold;
                        color: #2c1a06;
                        outline: none;
                        transition: border-color 0.15s;
                    }
                    .mef-stat-input:focus {
                        border-color: #8b6914;
                        box-shadow: 0 0 0 2px rgba(139,105,20,0.2);
                    }
                    .mef-stat-input.mef-error {
                        border-color: #b03a2e;
                    }

                    .mef-stat-modifier {
                        font-size: 0.78rem;
                        color: #6b4c11;
                        margin-top: 0.25rem;
                        font-style: italic;
                    }

                    .mef-actions {
                        display: flex;
                        gap: 0.75rem;
                        justify-content: flex-end;
                        margin-top: 1.5rem;
                    }

                    .mef-btn {
                        font-family: inherit;
                        font-size: 0.78rem;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        padding: 0.55rem 1.25rem;
                        border-radius: 3px;
                        cursor: pointer;
                        transition: background 0.15s, color 0.15s;
                    }

                    .mef-btn-cancel {
                        background: transparent;
                        border: 1px solid #8b6914;
                        color: #6b4c11;
                    }
                    .mef-btn-cancel:hover {
                        background: rgba(139,105,20,0.1);
                    }

                    .mef-btn-save {
                        background: #2c1a06;
                        border: 1px solid #2c1a06;
                        color: #c9a84c;
                    }
                    .mef-btn-save:hover:not(:disabled) {
                        background: #4a2e0a;
                    }
                    .mef-btn-save:disabled {
                        opacity: 0.55;
                        cursor: not-allowed;
                    }
                `}</style>

                <div className="mef-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
                    <div className="mef-sheet" role="dialog" aria-modal="true" aria-label="Edit member">

                        <div className="mef-header">
                            <h2 className="mef-title">Edit Member</h2>
                            <button className="mef-close" onClick={onCancel} aria-label="Close">✕</button>
                        </div>

                        <div className="mef-body">
                            {/* Name */}
                            <div className="mef-field">
                                <label className="mef-label" htmlFor="mef-name">Name</label>
                                <input
                                    id="mef-name"
                                    className={`mef-input${errors.Name ? ' mef-error' : ''}`}
                                    type="text"
                                    value={form.Name}
                                    onChange={e => this.handleTextChange('Name', e.target.value)}
                                    placeholder="Member name"
                                />
                                {errors.Name && <p className="mef-error-msg">{errors.Name}</p>}
                            </div>

                            {/* Tools */}
                            <div className="mef-field">
                                <label className="mef-label" htmlFor="mef-tools">Tools & Proficiencies</label>
                                <select
                                    id="mef-tools"
                                    className="mef-input"
                                    value={form.Tools ? _.map(form.Tools.split(','), val => val.trim()) : []}
                                    multiple={true}
                                    onChange={e => this.handleMultiSelectChange(e)}
                                >
                                    {_.map(ALL_TOOLS, tool => (<option value={tool} key={tool}>{tool}</option>))}
                                </select>
                            </div>

                            <hr className="mef-divider" />

                            {/* Ability Scores */}
                            <p className="mef-section-label">Ability Scores</p>
                            <div className="mef-stats-grid">
                                {STATS.map(({ key, abbr }) => (
                                    <div className="mef-stat-box" key={key}>
                                        <span className="mef-stat-abbr">{abbr}</span>
                                        <input
                                            className={`mef-stat-input${errors[key] ? ' mef-error' : ''}`}
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={form[key] as number}
                                            onChange={e => this.handleStatChange(key, e.target.value)}
                                            aria-label={abbr}
                                        />
                                        <span className="mef-stat-modifier">
                                            {modifier(form[key] as number)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mef-actions">
                                <button className="mef-btn mef-btn-cancel" onClick={onCancel}>
                                    Cancel
                                </button>
                                <button
                                    className="mef-btn mef-btn-save"
                                    onClick={this.handleSubmit}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        );
    }
}

export default MemberEditForm;