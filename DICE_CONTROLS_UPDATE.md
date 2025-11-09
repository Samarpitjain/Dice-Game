# Dice Controls Update - Stake Layout

## Changes Made

### 1. Created New Component: `DiceControls.jsx`
**Location:** `frontend/src/components/Main/DiceControls.jsx`

**Features:**
- **Multiplier** (read-only): Displays calculated payout multiplier
- **Roll Over/Under** (editable): Target number with direction switch button
- **Win Chance** (editable): Percentage input (0.01% - 95%)
- All inputs are functional and update game state in real-time
- Disabled during rolling to prevent mid-bet changes

### 2. Updated `RollBar.jsx`
- Added `DiceControls` component below the roll result
- Now shows: Roll Bar → Roll Result → Dice Controls (Stake layout)

### 3. Updated `ManualControls.jsx`
- Removed Win Chance input (moved to center)
- Removed Direction buttons (moved to center)
- Kept only: Bet Amount, Quick multipliers, Payout info, Roll button
- Cleaner sidebar focused on bet management

### 4. Updated `GameContext.jsx`
- Added `SET_TARGET` action to allow direct target editing
- Target changes automatically update win chance based on direction
- Maintains sync between target, win chance, and direction

## How It Works

### Direction Switch
- Click the refresh icon next to Roll Over/Under input
- Switches between "Roll Over" and "Roll Under"
- Automatically recalculates target based on win chance

### Editing Behavior
- **Win Chance**: Type percentage → Target updates automatically
- **Target**: Type number → Win Chance updates automatically
- **Direction**: Click switch → Target flips (e.g., 77 → 23)

### Calculations
- `Roll Under X` = Win Chance = X%
- `Roll Over X` = Win Chance = (100 - X)%
- `Multiplier` = 99 / Win Chance

## Functional in All Modes

✅ **Manual Mode**: Full control over all dice settings
✅ **Auto Mode**: Dice controls work while autobet runs
✅ **Advanced Mode**: Strategies can modify these values dynamically

## Layout Comparison

### Before (Your Game):
```
[Sidebar]           [Center]
- Bet Amount        - Roll Bar
- Win Chance        - Roll Result
- Direction
- Payout
- Roll Button
```

### After (Stake Style):
```
[Sidebar]           [Center]
- Bet Amount        - Roll Bar
- Payout            - Roll Result
- Roll Button       - Multiplier | Roll Over/Under | Win Chance
```

## Benefits

1. **Centralized Controls**: All dice settings in one place below the visual
2. **Universal Access**: Works in all 3 modes (Manual/Auto/Advanced)
3. **Better UX**: Matches industry standard (Stake, BC.Game, etc.)
4. **Cleaner Sidebar**: Focused on bet management only
5. **Visual Proximity**: Controls are next to the roll bar they affect

## Files Modified

1. `frontend/src/components/Main/DiceControls.jsx` (NEW)
2. `frontend/src/components/Main/RollBar.jsx`
3. `frontend/src/components/LeftControls/ManualControls.jsx`
4. `frontend/src/contexts/GameContext.jsx`

All changes are minimal and maintain existing functionality! 🎲
