import React from 'react'

import Select from 'react-select'
import { Button, Container, Form } from 'react-bootstrap'

import "./Home.css"
import Img from "./img.svg"

class ForgeCommissionForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            discordId: "",
            character: "",
            category: null,
            baseItem: null,
            enchantment: null,
            providingBase: false,
            // Populated from /api/all-items on mount
            allItems: [],
            allEnchantments: [],
        };

        this.onSubmit = this.onSubmit.bind(this);
    }

    async componentDidMount() {
        try {
            const res  = await fetch('/api/all-items');
            const data = await res.json();
            this.setState({
                allItems:        data.items        ?? [],
                allEnchantments: data.enchantments ?? [],
            });
        } catch (e) {
            console.error('Failed to load forge data', e);
        }
    }

    onSubmit(e) {
        e.preventDefault();
        // TODO: wire up your submission logic here
    }

    handleCategoryChange(selected) {
        // Reset dependent selects when category changes
        this.setState({ category: selected, baseItem: null, enchantment: null });
    }

    getFilteredItems() {
        const { category, allItems } = this.state;
        if (!category) return [];
        return allItems
            .filter(i => i.category === category.value)
            .map(i => ({ value: String(i.id), label: i.name }));
    }

    getFilteredEnchantments() {
        const { category, allEnchantments } = this.state;
        if (!category) return [];
        return allEnchantments
            .filter(e => e.category === category.value)
            .map(e => ({ value: String(e.id), label: e.name }));
    }

    render() {
        const { discordId, character, category, baseItem, enchantment, providingBase } = this.state;

        const categoryOptions = [
            { value: 'weapon',     label: 'Weapon'     },
            { value: 'armor',      label: 'Armor'      },
            { value: 'consumable', label: 'Consumable' },
            { value: 'poison',     label: 'Poison'     },
        ];

        const selectStyles = {
            control:     (b) => ({ ...b, background: 'transparent', border: 'none', borderBottom: '1.5px solid #5a3e1b88', borderRadius: 0, boxShadow: 'none', fontFamily: "'Kalam', cursive", fontSize: '1rem', color: '#1a0f05' }),
            menu:        (b) => ({ ...b, background: '#f4e8c1', fontFamily: "'Kalam', cursive" }),
            option:      (b, s) => ({ ...b, background: s.isSelected ? '#5a3e1b' : s.isFocused ? '#e8d89a' : 'transparent', color: s.isSelected ? '#f4e8c1' : '#1a0f05' }),
            singleValue: (b) => ({ ...b, color: '#1a0f05' }),
            placeholder: (b) => ({ ...b, color: '#5a3e1b88' }),
            indicator:   (b) => ({ ...b, color: '#5a3e1b' }),
            indicatorSeparator: () => ({ display: 'none' }),
        };

        return (
            <Container className="page-wrap">
                <div className="parchment">
                    <div className="corner-ornament tl"><i className="fas fa-crown"></i></div>
                    <div className="corner-ornament tr"><i className="fas fa-crown"></i></div>
                    <div className="corner-ornament bl"><i className="fas fa-fire-flame-curved"></i></div>
                    <div className="corner-ornament br"><i className="fas fa-fire-flame-curved"></i></div>

                    <div className="text-center mb-2">
                        <img src={Img} alt="Logo" />
                    </div>

                    <h1 className="parchment-title">The Forge</h1>
                    <p className="parchment-subtitle">Commission Request Scroll</p>

                    <div className="ink-divider">
                        <i className="fas fa-hammer"></i>
                        <i className="fas fa-shield-halved"></i>
                        <i className="fas fa-hammer fa-flip-horizontal"></i>
                    </div>

                    <Form className="row" onSubmit={this.onSubmit}>

                        {/* ── Discord ID ── */}
                        <Form.Group className="mb-3 col-12 col-md-6" controlId="formDiscordId">
                            <Form.Label className="ink-label">
                                <i className="fas fa-hashtag fa-xs me-1"></i> Discord ID
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. Aragorn#4291"
                                value={discordId}
                                onChange={(e) => this.setState({ discordId: e.target.value })}
                            />
                        </Form.Group>

                        {/* ── Character ── */}
                        <Form.Group className="mb-3 col-12 col-md-6" controlId="formCharacter">
                            <Form.Label className="ink-label">
                                <i className="fas fa-person fa-xs me-1"></i> Character
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Your character's name"
                                value={character}
                                onChange={(e) => this.setState({ character: e.target.value })}
                            />
                        </Form.Group>

                        <hr className="section-rule" />

                        {/* ── Category ── */}
                        <Form.Group className="mb-3 col-12 col-md-6" controlId="formCategory">
                            <Form.Label className="ink-label">
                                <i className="fas fa-tag fa-xs me-1"></i> Category
                            </Form.Label>
                            <div className="select-wrap">
                                <Select
                                    value={category}
                                    onChange={(selected) => this.handleCategoryChange(selected)}
                                    options={categoryOptions}
                                    placeholder="— choose category —"
                                    styles={selectStyles}
                                />
                            </div>
                        </Form.Group>

                        {/* ── Base Item ── */}
                        <Form.Group className="mb-3 col-12 col-md-6" controlId="formBaseItem">
                            <Form.Label className="ink-label">
                                <i className="fas fa-scroll fa-xs me-1"></i> Base Item
                            </Form.Label>
                            <div className="select-wrap">
                                <Select
                                    value={baseItem}
                                    onChange={(selected) => this.setState({ baseItem: selected })}
                                    options={this.getFilteredItems()}
                                    placeholder="— none selected —"
                                    isDisabled={!category}
                                    styles={selectStyles}
                                />
                            </div>
                        </Form.Group>

                        {/* ── Enchantment ── */}
                        <Form.Group className="col-12" controlId="formEnchantment">
                            <Form.Label className="ink-label">
                                <i className="fas fa-wand-sparkles fa-xs me-1"></i> Enchantment
                            </Form.Label>
                            <div className="select-wrap">
                                <Select
                                    value={enchantment}
                                    onChange={(selected) => this.setState({ enchantment: selected })}
                                    options={this.getFilteredEnchantments()}
                                    placeholder="— no enchantment —"
                                    isDisabled={!category}
                                    styles={selectStyles}
                                />
                            </div>
                        </Form.Group>

                        {/* ── Provide base item ── */}
                        <Form.Group className="col-12 mt-3" controlId="formProvidingBase">
                            <div className="ink-check-wrap">
                                <Form.Check
                                    checked={providingBase}
                                    onChange={(e) => this.setState({ providingBase: e.target.checked })}
                                />
                                <Form.Label className="ink-check-label">
                                    <i className="fas fa-hand-holding fa-xs me-1"></i>
                                    I shall provide the base item myself
                                </Form.Label>
                            </div>
                        </Form.Group>

                        {/* ── Wax seal submit ── */}
                        <div className="wax-seal-wrap">
                            <Button type="submit" className="wax-seal-btn">
                                <i className="fas fa-stamp"></i>
                                Submit
                            </Button>
                            <p className="seal-caption">Press your seal to commission</p>
                        </div>

                    </Form>

                    <div className="task-id-note">
                        <i className="fas fa-feather fa-xs"></i>
                        A unique scroll number shall be assigned upon submission
                    </div>

                    <p className="parchment-footer">
                        All commissions are subject to the laws of The Forge &amp; its masters
                    </p>

                </div>
            </Container>
        );
    }
}

export default ForgeCommissionForm;
