import os

def inspect_multipart_data(filename):
    print(f"Inspecting file: {filename}")
    try:
        with open(filename, 'rb') as f:
            content = f.read()

        print(f"File size: {len(content)} bytes")

        # --- Dynamically find the boundary string from the first part's boundary ---
        # The boundary string itself (without the leading '--') is what we need.
        # It's typically after '--' and before '\r\n'
        
        # Find the start of the first actual boundary (after initial headers, like 'Content-Type: multipart/form-data; boundary=...')
        # We look for '--WebKitFormBoundary' which should be the first instance of a real boundary delimiter.
        first_boundary_marker_start = content.find(b'--WebKitFormBoundary')
        if first_boundary_marker_start == -1:
            print("Error: Could not find '--WebKitFormBoundary' marker in the file (start of any boundary).")
            return

        # The actual boundary string in the Content-Type header does NOT include the leading '--'.
        # So, we want to extract the unique ID part, which starts after the '--'.
        # Let's find the first instance of 'WebKitFormBoundary'
        boundary_id_start = content.find(b'WebKitFormBoundary', first_boundary_marker_start)
        if boundary_id_start == -1:
            print("Error: Could not find 'WebKitFormBoundary' ID string.")
            return
        
        # Find the end of the boundary string (usually followed by \r\n)
        # This will be the end of the unique ID part before the CRLF.
        boundary_id_end = content.find(b'\r\n', boundary_id_start)
        if boundary_id_end == -1:
            print("Error: Could not find end of the initial boundary ID string (missing \\r\\n).")
            return
        
        # Extract just the unique ID part of the boundary, as it would appear in the Content-Type header.
        # Example: 'WebKitFormBoundary6zhEl2nKX01cAOGH'
        extracted_boundary_id = content[boundary_id_start:boundary_id_end]
        
        # The full boundary delimiter that appears in the message body is '--' + extracted_boundary_id
        boundary_delimiter = b'--' + extracted_boundary_id 
        print(f"\nDynamically extracted boundary delimiter: '{boundary_delimiter.decode('ascii')}'")


        jpeg_eoi = b'\xFF\xD9' # JPEG End of Image marker

        # Find the end of the first part (image data)
        jpeg_eoi_pos = content.find(jpeg_eoi)
        
        if jpeg_eoi_pos == -1:
            print("Error: JPEG End of Image marker (FF D9) not found in the file.")
            return

        print(f"\nFound JPEG EOI (FF D9) at byte position: {jpeg_eoi_pos}")

        # Now, check the bytes immediately after the JPEG EOI marker
        check_start_pos = jpeg_eoi_pos + len(jpeg_eoi)
        
        # Display the bytes right after JPEG EOI (up to 70 bytes to see the next header)
        bytes_after_jpeg = content[check_start_pos : check_start_pos + 70]
        print(f"Bytes immediately after JPEG EOI (up to 70 bytes):")
        print(bytes_after_jpeg.hex()) # Print in hexadecimal for clarity

        # The full expected sequence: CRLF + boundary_delimiter
        crlf_boundary_sequence = b'\r\n' + boundary_delimiter
        print(f"Searching for this exact sequence (CRLF + boundary delimiter): '{crlf_boundary_sequence.decode('ascii', errors='ignore')}'")
        print(f"Expected sequence hex: {crlf_boundary_sequence.hex()}")

        # Perform a direct byte-by-byte comparison at the expected location
        expected_sequence_start = check_start_pos
        expected_sequence_end = check_start_pos + len(crlf_boundary_sequence)

        if expected_sequence_end > len(content):
            print("Error: Not enough content in file to verify CRLF followed by boundary at expected position.")
            course_code_boundary_pos = -1
        else:
            actual_sequence_at_position = content[expected_sequence_start:expected_sequence_end]
            
            print(f"Actual sequence found at position {expected_sequence_start} (length {len(actual_sequence_at_position)}):")
            print(f"  Actual sequence hex: {actual_sequence_at_position.hex()}")

            if actual_sequence_at_position == crlf_boundary_sequence:
                print("Confirmed: The exact CRLF+Boundary sequence is present at the expected location.")
                course_code_boundary_pos = check_start_pos # Set it directly as found.
            else:
                print("Mismatch: CRLF+Boundary sequence is NOT exactly as expected. Performing byte-by-byte comparison:")
                # Print the difference if possible
                for i in range(min(len(crlf_boundary_sequence), len(actual_sequence_at_position))):
                    if crlf_boundary_sequence[i] != actual_sequence_at_position[i]:
                        print(f"  Difference at byte {i} (offset from expected start): Expected {crlf_boundary_sequence[i]:02x}, Actual {actual_sequence_at_position[i]:02x}")
                course_code_boundary_pos = -1 # Indicate not found.

        if course_code_boundary_pos != -1: # This will now be `check_start_pos` if confirmed
            print(f"\nProceeding with parsing from confirmed boundary position: {course_code_boundary_pos}")
            
            # --- Extract and verify course_code ---
            # Search for "Content-Disposition: form-data; name="course_code"" after this boundary
            # The actual part starts after the boundary delimiter and its trailing CRLF
            course_code_part_start_search = course_code_boundary_pos + len(crlf_boundary_sequence) 
            course_code_header_start = content.find(b'Content-Disposition: form-data; name="course_code"', course_code_part_start_search)
            
            if course_code_header_start != -1:
                # Find the end of headers (double CRLF) after the Content-Disposition line
                course_code_headers_end = content.find(b'\r\n\r\n', course_code_header_start)

                if course_code_headers_end != -1:
                    course_code_value_start_pos = course_code_headers_end + len(b'\r\n\r\n')
                    
                    # Find the next boundary (CRLF + boundary_delimiter)
                    next_part_boundary_pos = content.find(crlf_boundary_sequence, course_code_value_start_pos)
                    
                    if next_part_boundary_pos != -1:
                        course_code_value_raw = content[course_code_value_start_pos:next_part_boundary_pos]
                        try:
                            actual_value = course_code_value_raw.rstrip(b'\r\n').decode('utf-8')
                            print(f"Extracted course_code value: '{actual_value}'")
                        except UnicodeDecodeError:
                            print(f"Could not decode course_code value. Raw bytes: {course_code_value_raw.hex()}")
                    else:
                        print("Error: Could not find next boundary after course_code value.")
                else:
                    print("Error: Could not find end of headers for course_code part.")
            else:
                print("Error: Could not find 'Content-Disposition: form-data; name=\"course_code\"' part.")

            # --- Extract and verify schedule_id ---
            # The schedule_id boundary should appear after the course_code part ends
            if next_part_boundary_pos != -1: # Ensure previous boundary was found
                schedule_id_part_start_search = next_part_boundary_pos + len(crlf_boundary_sequence) 
                schedule_id_header_start = content.find(b'Content-Disposition: form-data; name="schedule_id"', schedule_id_part_start_search)
                
                if schedule_id_header_start != -1:
                    schedule_id_headers_end = content.find(b'\r\n\r\n', schedule_id_header_start)
                    
                    if schedule_id_headers_end != -1:
                        schedule_id_value_start_pos = schedule_id_headers_end + len(b'\r\n\r\n')
                        
                        # The final boundary is `boundary_delimiter--`
                        final_boundary_expected = boundary_delimiter + b'--'
                        final_boundary_pos = content.find(final_boundary_expected, schedule_id_value_start_pos)

                        if final_boundary_pos != -1:
                            schedule_id_value_raw = content[schedule_id_value_start_pos:final_boundary_pos]
                            try:
                                actual_schedule_id_value = schedule_id_value_raw.rstrip(b'\r\n').decode('utf-8')
                                print(f"Extracted schedule_id value: '{actual_schedule_id_value}'")
                                print("\nAll parts appear to be correctly formatted and found.")
                            except UnicodeDecodeError:
                                print(f"Could not decode schedule_id value. Raw bytes: {schedule_id_value_raw.hex()}")
                        else:
                            print("Error: Could not find final boundary after schedule_id. Request might be truncated or malformed.")
                    else:
                        print("Error: Could not find end of headers for schedule_id part.")
                else:
                    print("Error: Could not find 'Content-Disposition: form-data; name=\"schedule_id\"' part.")
            else:
                print("Skipping schedule_id check as course_code's next boundary was not found.")
        else:
            print("\nInitial CRLF followed by expected boundary after image data was NOT found.")
            print("This indicates a fundamental issue with the multipart structure at this key point.")

    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# --- REPLACE THIS WITH YOUR ACTUAL FILENAME ---
file_to_inspect = "raw_request_20250618_192937_640605.bin" 

inspect_multipart_data(file_to_inspect)
