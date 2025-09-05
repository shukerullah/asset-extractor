#!/usr/bin/env python3
"""
Background Removal Script using rembg
Processes images and removes backgrounds locally
"""

import sys
import os
from pathlib import Path
from rembg import remove, new_session
from PIL import Image
import io
import argparse

def remove_background(input_path: str, output_path: str, model: str = "u2net") -> bool:
    """
    Remove background from an image
    
    Args:
        input_path: Path to input image
        output_path: Path to save output image
        model: Model to use (u2net, silueta, etc.)
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # Read input image
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
        
        # Create session with model
        session = new_session(model)
        
        # Remove background
        output_data = remove(input_data, session=session)
        
        # Save output image
        with open(output_path, 'wb') as output_file:
            output_file.write(output_data)
        
        return True
        
    except Exception as e:
        print(f"Error removing background: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description='Remove background from images')
    parser.add_argument('input', help='Input image path')
    parser.add_argument('output', help='Output image path')
    parser.add_argument('--model', default='u2net', 
                       choices=['u2net', 'u2netp', 'u2net_human_seg', 'u2net_cloth_seg', 'isnet-general-use'],
                       help='Model to use for background removal')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Check if input file exists
    if not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' does not exist", file=sys.stderr)
        sys.exit(1)
    
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(args.output)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    if args.verbose:
        print(f"Processing: {args.input} -> {args.output}")
        print(f"Using model: {args.model}")
    
    # Remove background
    success = remove_background(args.input, args.output, args.model)
    
    if success:
        if args.verbose:
            print("Background removal completed successfully!")
        sys.exit(0)
    else:
        print("Background removal failed", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()