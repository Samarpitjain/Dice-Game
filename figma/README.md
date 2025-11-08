# Figma Design System

## Design File
**Figma Link**: [Dice Game Design System](https://www.figma.com/file/dice-game-design)

## Design Tokens

The `design-tokens.json` file contains all design system values that should be imported into Figma using the Figma Tokens plugin.

### Color Palette

#### Background & Surfaces
- **Background**: `#0F0F12` - Main app background
- **Border**: `#1E1E23` - Cards, borders, secondary surfaces

#### Text Colors
- **Primary**: `#FFFFFF` - Main text, headings
- **Secondary**: `#8F9BA8` - Labels, descriptions, muted text

#### Accent Colors
- **Blue**: `#1A9FFF` - Primary actions, links, focus states
- **Green**: `#00C74D` - Success, wins, positive values
- **Red**: `#FF3B30` - Errors, losses, negative values

### Typography

#### Font Families
- **Primary**: Inter (system fallback: system-ui, sans-serif)
- **Monospace**: ui-monospace (for numbers, code, seeds)

#### Font Sizes
- **xs**: 12px - Small labels, captions
- **sm**: 14px - Body text, form inputs
- **base**: 16px - Default body text
- **lg**: 18px - Subheadings
- **xl**: 20px - Headings
- **2xl**: 24px - Large headings
- **3xl**: 30px - Display text, roll results

#### Font Weights
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Buttons, labels
- **Bold**: 700 - Headings, important text

### Layout & Spacing

#### Spacing Scale
- **xs**: 4px - Tight spacing
- **sm**: 8px - Small gaps
- **md**: 16px - Standard spacing
- **lg**: 24px - Section spacing
- **xl**: 32px - Large gaps
- **2xl**: 48px - Major sections

#### Border Radius
- **Input**: 6px - Form inputs, small buttons
- **Card**: 8px - Cards, panels
- **Control**: 20px - Primary buttons, major controls

### Component Specifications

#### Buttons

**Primary Button**
- Background: `#1A9FFF`
- Text: `#FFFFFF`
- Padding: 12px 24px
- Border Radius: 20px
- Font: 600 weight, 14px
- Hover: Glow effect with `rgba(26, 159, 255, 0.3)`

**Secondary Button**
- Background: `#1E1E23`
- Text: `#FFFFFF`
- Padding: 12px 24px
- Border Radius: 20px
- Font: 600 weight, 14px
- Hover: Lighten background

**Success Button**
- Background: `#00C74D`
- Text: `#FFFFFF`
- Padding: 16px 32px (large size)
- Border Radius: 20px
- Font: 600 weight, 16px

#### Form Inputs
- Background: `#1E1E23`
- Border: 1px solid `#8F9BA8`
- Text: `#FFFFFF`
- Padding: 8px 16px
- Border Radius: 6px
- Focus: Border color `#1A9FFF`

#### Cards
- Background: `#1E1E23`
- Border: 1px solid `#8F9BA8`
- Border Radius: 8px
- Padding: 16px
- Shadow: Subtle dark shadow

### Layout Grid

#### Desktop (1024px+)
- 12 column grid
- Left sidebar: 3 columns (25%)
- Main content: 6 columns (50%)
- Right sidebar: 3 columns (25%)
- Gutter: 24px

#### Tablet (768px - 1023px)
- 8 column grid
- Stacked layout with full-width sections
- Gutter: 16px

#### Mobile (< 768px)
- 4 column grid
- Single column layout
- Controls → Main → Stats (vertical stack)
- Gutter: 16px

### Animation Specifications

#### Roll Animation
- Duration: 400ms
- Easing: ease-out
- Roll bar sweep from left to right
- Number flicker: 250ms with opacity animation

#### Button Interactions
- Hover glow: 180ms ease
- Press: 150ms ease with slight scale

#### Modal Transitions
- Backdrop fade: 200ms ease
- Modal scale: 200ms ease with slight bounce

### Component States

#### Roll Bar States
1. **Idle**: Gray background, target line visible
2. **Rolling**: Animated indicator sweeping, "Rolling..." text
3. **Result**: Final position with win/loss color, result number

#### Bet History Item
- **Win**: Green indicator dot, positive profit in green
- **Loss**: Red indicator dot, negative profit in red
- **Hover**: Slight background highlight

### Accessibility

#### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio minimum)
- Interactive elements have clear focus indicators
- Error states use both color and text/icons

#### Focus Management
- Visible focus rings on all interactive elements
- Logical tab order through interface
- Modal focus trapping

### Export Guidelines

#### Icons
- 24x24px for standard icons
- 16x16px for small icons
- SVG format with single color fills
- Use Lucide React icon library when possible

#### Images
- Export at 2x resolution for retina displays
- Use WebP format for better compression
- Provide fallback PNG for older browsers

### Figma Plugin Recommendations

1. **Figma Tokens** - Import design tokens
2. **Auto Layout** - Responsive component creation
3. **Component Inspector** - Generate CSS from components
4. **Stark** - Accessibility contrast checking
5. **Figma to Code** - Export React components

### Design System Maintenance

#### Version Control
- Tag major design system updates
- Document breaking changes
- Maintain component changelog

#### Component Updates
- Test components in all states
- Verify accessibility compliance
- Update documentation with changes
- Sync with development team

#### Quality Checklist
- [ ] All colors from design tokens
- [ ] Typography follows scale
- [ ] Spacing uses system values
- [ ] Components work in all breakpoints
- [ ] Accessibility requirements met
- [ ] Animation timing consistent
- [ ] Focus states defined
- [ ] Error states designed