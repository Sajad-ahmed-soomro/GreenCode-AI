#!/bin/bash
echo "========================================="
echo "GreenCode AI - Integration Test"
echo "========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Print functions
print_step() {
    echo -e "\n${YELLOW}[STEP $1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_step "0" "Checking environment..."
echo "Current directory: $(pwd)"

# Step 1: Check if issues.json exists
if [ -f "issues.json" ]; then
    print_success "Found existing issues.json"
else
    print_step "1" "Running Python Classifier..."
    
    if [ ! -d "classifier" ]; then
        print_error "classifier directory not found!"
        exit 1
    fi
    
    cd classifier
    
    # Check if unified results exist
    if [ ! -f "../../test_data/unified_results.json" ]; then
        print_error "Unified results not found at ../../test_data/unified_results.json"
        echo "Please provide the path to unified_results.json:"
        read -p "Path: " UNIFIED_PATH
        if [ ! -f "$UNIFIED_PATH" ]; then
            print_error "File not found: $UNIFIED_PATH"
            exit 1
        fi
        UNIFIED_RESULTS="$UNIFIED_PATH"
    else
        UNIFIED_RESULTS="../../test_data/unified_results.json"
    fi
    
    print_success "Using: $UNIFIED_RESULTS"
    
    # Run classifier
    python3 main.py "$UNIFIED_RESULTS"
    
    if [ $? -ne 0 ]; then
        print_error "Python classifier failed!"
        exit 1
    fi
    
    if [ ! -f "issues.json" ]; then
        print_error "issues.json not created!"
        exit 1
    fi
    
    # Count issues
    ISSUE_COUNT=$(python3 -c "import json; data=json.load(open('issues.json')); print(len(data))" 2>/dev/null || echo "unknown")
    print_success "Generated $ISSUE_COUNT issues"
    
    # Move to parent directory
    mv issues.json ../
    cd ..
fi

# ========== STEP 2: Check ADVANCED Go engine (engine/) ==========
print_step "2" "Checking ADVANCED Go Engine..."

if [ ! -d "engine" ]; then
    print_error "engine directory not found!"
    echo "Expected structure: engine/cmd/engine/main.go"
    exit 1
fi

if [ ! -f "engine/cmd/engine/main.go" ]; then
    print_error "main.go not found at engine/cmd/engine/main.go"
    echo "Directory structure:"
    find engine -type f -name "*.go" | head -10
    exit 1
fi

print_success "Found ADVANCED Go engine at engine/cmd/engine/main.go"

# ========== STEP 3: Prepare Go Engine ==========
print_step "3" "Preparing Go Engine..."

cd engine

# Copy issues.json if not present
if [ ! -f "issues.json" ] && [ -f "../issues.json" ]; then
    cp ../issues.json .
    print_success "Copied issues.json to engine/"
fi

if [ ! -f "issues.json" ]; then
    print_error "issues.json not found in engine/"
    exit 1
fi

# Initialize Go module if needed
if [ ! -f "go.mod" ]; then
    print_success "Initializing Go module..."
    go mod init greencode-engine
fi

# ========== STEP 4: Run ADVANCED Go Engine ==========
print_step "4" "Running ADVANCED Go Engine..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    print_error "Go is not installed!"
    exit 1
fi

# Build and run
print_success "Building ADVANCED engine..."
go build -o bin/engine cmd/engine/main.go

if [ $? -ne 0 ]; then
    print_error "Build failed! Trying to run directly..."
    go run cmd/engine/main.go
    if [ $? -ne 0 ]; then
        print_error "Go engine failed!"
        exit 1
    fi
else
    print_success "Build successful, running..."
    ./bin/engine
fi

# ========== STEP 5: Check Output ==========
print_step "5" "Checking output..."

# Check for output files
OUTPUT_FILE=""
if [ -f "advanced_patches.json" ]; then
    OUTPUT_FILE="advanced_patches.json"
    print_success "Found advanced_patches.json"
elif [ -f "patches.json" ]; then
    OUTPUT_FILE="patches.json"
    print_success "Found patches.json"
else
    # Check in cmd/engine directory
    if [ -f "cmd/engine/patches.json" ]; then
        OUTPUT_FILE="cmd/engine/patches.json"
        print_success "Found patches.json in cmd/engine/"
        cp cmd/engine/patches.json .
    else
        print_error "No output file created!"
        echo "Looking for output files:"
        find . -name "*.json" -type f | grep -E "(patch|issue)" | head -10
        exit 1
    fi
fi

# ========== STEP 6: Show Results ==========
print_step "6" "Results Summary"
echo "-----------------------------------------"

if [ -f "$OUTPUT_FILE" ]; then
    # Count patches
    PATCH_COUNT=$(python3 -c "
import json
try:
    with open('$OUTPUT_FILE', 'r') as f:
        data = json.load(f)
    print(len(data))
except Exception as e:
    print('0')
" 2>/dev/null || echo "0")
    
    print_success "Generated $PATCH_COUNT ADVANCED patches"
    
    # Show advanced analysis
    echo -e "\n${YELLOW}Advanced Analysis:${NC}"
    python3 -c "
import json
try:
    with open('$OUTPUT_FILE', 'r') as f:
        patches = json.load(f)
    
    if not patches:
        print('No patches generated')
        exit(0)
    
    # Check if advanced
    first = patches[0]
    is_advanced = 'diff' in first or 'originalCode' in first or 'fixedCode' in first
    
    print(f'Engine type: {\"ADVANCED\" if is_advanced else \"SIMPLE\"}')
    
    if is_advanced:
        # Advanced features
        diffs = sum(1 for p in patches if p.get('diff'))
        auto = sum(1 for p in patches if p.get('autoApply'))
        print(f'Patches with diffs: {diffs}')
        print(f'Auto-applicable: {auto}')
        
        # Show first advanced patch
        print('\\nFirst ADVANCED patch:')
        p = patches[0]
        print(f'  Type: {p.get(\"issueType\", \"N/A\")}')
        print(f'  File: {p.get(\"filePath\", \"N/A\")}')
        if p.get('explanation'):
            print(f'  Explanation: {p[\"explanation\"][:50]}...')
        if p.get('diff'):
            print(f'  Has diff: Yes')
            diff = p['diff']
            lines = diff.split('\\n')
            if len(lines) > 3:
                print(f'  Diff preview: {lines[0]}')
                print(f'               {lines[1]}')
                print(f'               ...')
    else:
        # Simple patches
        print('\\n⚠️  WARNING: Engine is generating SIMPLE patches')
        print('First simple patch:')
        p = patches[0]
        print(f'  Fix: {p.get(\"fix\", \"N/A\")[:50]}...')
    
    # Count by type
    print('\\nBy issue type:')
    types = {}
    for p in patches:
        t = p.get('issueType', p.get('type', 'unknown'))
        types[t] = types.get(t, 0) + 1
    
    for t, c in sorted(types.items()):
        print(f'  {t[:25]:25} {c:3d}')
        
except Exception as e:
    print(f'Error analyzing output: {e}')
"
    
    # Copy patches to parent directory
    cp "$OUTPUT_FILE" ../
    print_success "Copied $OUTPUT_FILE to parent directory"
else
    print_error "$OUTPUT_FILE not created!"
fi

echo -e "\n${GREEN}✅ Test completed successfully!${NC}"