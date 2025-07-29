# Mock Data Generation for SIM Card Management

This document explains how to generate 100 mock SIM cards for testing the SIM Card Management system.

## Overview

The mock data generator creates realistic Indonesian SIM card data including:
- 📱 Indonesian phone numbers (various providers)
- 🆔 NIK (National ID numbers) 
- 👨‍👩‍👧‍👦 KK (Family Card numbers)
- 📅 Random activation dates and expiry periods
- 📦 Assignment to existing Box Kecil or temporary boxes
- ✅ Various statuses (active, inactive, used)

## Changes Made

### 1. Removed Kapasitas from Box Kecil ✅
- Removed capacity field from Box Kecil form
- Removed capacity display from Box Kecil cards
- Simplified Box Kecil management (no more capacity limits)

### 2. Added Mock Data Generation System ✅
- Created browser-compatible mock data generator
- Added button to dashboard for easy generation
- Created PowerShell script for command-line generation

## How to Generate Mock Data

### Method 1: Using Dashboard Button (Easiest)
1. Start the development server: `npm run dev`
2. Open the application in your browser
3. Click "Add 100 Mock SIM Cards" button in the top-right header
4. Check browser console for progress
5. Page will automatically refresh when complete

### Method 2: Using PowerShell Script
1. Make sure the development server is running (`npm run dev`)
2. Open PowerShell in the project root directory
3. Run: `.\addMockData.ps1`
4. Follow the prompts and check browser console for progress

### Method 3: Using Browser Console
1. Open the application in your browser
2. Open browser console (F12)
3. Load the mock data script:
   ```javascript
   const script = document.createElement('script');
   script.src = '/mockDataGenerator.js';
   document.head.appendChild(script);
   ```
4. After script loads, run:
   ```javascript
   addMockSimCardsToFirebase(100)
   ```

## Mock Data Details

### Phone Numbers
- Realistic Indonesian mobile prefixes (0811, 0812, 0821, etc.)
- 8-digit suffix numbers
- Covers major providers: Telkomsel, Indosat, XL, Tri, Smartfren, Axis

### NIK Numbers
- 16-digit format following Indonesian standard
- Regional prefixes (3201-3210)
- Random birth date and sequence numbers

### KK Numbers  
- 16-digit family card numbers
- Regional prefixes (3301-3310)
- Random identification sequences

### Status Distribution
- 40% Active cards
- 30% Inactive cards  
- 30% Used cards

### Box Assignment
- Automatically assigns to existing Box Kecil
- Creates temporary box if no boxes exist
- Evenly distributes across available boxes

## Verification

After generation, check:
1. **Dashboard Stats**: Should show increased card counts
2. **SIM Cards Tab**: Browse the new cards
3. **Search Function**: Test searching for generated cards
4. **Box Assignments**: Verify cards are properly assigned to boxes

## Files Created/Modified

### New Files:
- `public/mockDataGenerator.js` - Browser-compatible generator
- `src/utils/mockDataGenerator.js` - ES6 module version
- `src/scripts/addMockData.js` - Advanced generation script
- `addMockData.ps1` - PowerShell script for Windows
- `MOCK_DATA_README.md` - This documentation

### Modified Files:
- `src/app/components/RackManagementNew.js` - Removed kapasitas field
- `src/app/page.js` - Added mock data generation button

## Troubleshooting

### "No Box Kecil found" Warning
- Create at least one Rak Kartu with Box Besar and Box Kecil first
- Or let the system create temporary boxes automatically

### Generation Fails
- Check browser console for detailed error messages
- Ensure development server is running
- Verify Firebase connection is working

### Server Not Responding
- Confirm server is running on correct port
- Check for CORS issues in browser console
- Restart development server if needed

## Data Cleanup

To remove mock data:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Delete documents from `simcards` collection
4. Or implement a cleanup function (not included)

## Next Steps

After generating mock data:
1. Test all application features with realistic data
2. Verify search and filtering functions
3. Test earnings calculations with sample workers
4. Check QR code generation with multiple phone numbers
5. Validate hierarchical organization (Rak > Box Besar > Box Kecil)

---

*Generated mock data is for testing purposes only and uses fictional phone numbers and ID numbers.*
