import cv2
import numpy as np

def determine_cube_corners(frame):
    # Convert the frame to grayscale for edge detection
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Apply bilateral filter to reduce noise while preserving edges
    filtered_frame = cv2.bilateralFilter(gray_frame, 9, 75, 75)
    
    # Apply Gaussian blur to smooth the image
    blurred = cv2.GaussianBlur(filtered_frame, (5, 5), 0)
    
    # Detect edges using Canny
    edged = cv2.Canny(blurred, 50, 150)
    
    # Dilate edges to connect broken lines
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(edged, kernel, iterations=1)
    
    # Find contours
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter contours by area to find potential cube faces
    min_area = 1000  # Adjust based on your camera setup
    cube_contours = []
    
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > min_area:
            # Approximate the contour to a polygon
            epsilon = 0.02 * cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, epsilon, True)
            
            # Look for quadrilaterals (4 corners) which could be cube faces
            if len(approx) == 4:
                cube_contours.append(approx)
    
    # Draw the detected contours on the original frame
    result_frame = frame.copy()
    cv2.drawContours(result_frame, cube_contours, -1, (0, 255, 0), 2)
    
    # Draw corner points
    for contour in cube_contours:
        for point in contour:
            x, y = point[0]
            cv2.circle(result_frame, (x, y), 5, (0, 0, 255), -1)
    
    # Show the result
    cv2.imshow("Edges", result_frame)
    
    return cube_contours 


def detect_face_color(frame):
    # Convert the frame to HSV color space
    hsv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Define color ranges for Rubik's cube colors
    # You may need to adjust these ranges based on your lighting conditions
    color_ranges = {
        'white': ([0, 0, 200], [180, 30, 255]),
        'yellow': ([20, 100, 100], [30, 255, 255]),
        'red': ([0, 100, 100], [10, 255, 255]),
        'orange': ([10, 100, 100], [20, 255, 255]),
        'green': ([40, 100, 100], [80, 255, 255]),
        'blue': ([100, 100, 100], [140, 255, 255])
    }
    
    # Create masks for each color
    color_masks = {}
    for color_name, (lower, upper) in color_ranges.items():
        lower = np.array(lower, dtype=np.uint8)
        upper = np.array(upper, dtype=np.uint8)
        mask = cv2.inRange(hsv_frame, lower, upper)
        color_masks[color_name] = mask
    
    # Show color detection results
    result_frame = frame.copy()
    for color_name, mask in color_masks.items():
        # Find contours in the mask
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Draw contours for significant color regions
        for contour in contours:
            if cv2.contourArea(contour) > 100:  # Minimum area threshold
                cv2.drawContours(result_frame, [contour], -1, (0, 255, 0), 2)
                # Add color label
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    cv2.putText(result_frame, color_name, (cx, cy), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    cv2.imshow("Color Detection", result_frame)
    return color_masks



    

if __name__ == "__main__":
    print("Starting video capture...")
    cam = cv2.VideoCapture(0)
    frame_width = int(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter("output.avi", cv2.VideoWriter_fourcc(*"MJPG"), 10, (frame_width, frame_height))
    while True:
        ret, frame = cam.read()
        out.write(frame)

        # Draw vertical and horizontal lines at the center of the frame
        width = frame.shape[1]
        height = frame.shape[0]
        # Define a constant to scale the length of the lines
        LINE_SCALE = 1.5
        LINE_SIZE = 7
        LINE_COLOR = (255, 255, 255)

        # Draw vertical line (centered cross)
        cv2.line(
            frame,
            (width // 2, height // 2),
            (width // 2, int(height // 2 + 100 * LINE_SCALE)),
            LINE_COLOR,
            LINE_SIZE
        )
        # Draw horizontal line 
        cv2.line(
            frame,
            (width // 2, height // 2),
            (int(width // 2 + 75 * LINE_SCALE), int(height // 2 - 50 * LINE_SCALE)),
            LINE_COLOR,
            LINE_SIZE
        )
        # Draw reflected horizontal line on the y axis
        cv2.line(
            frame,
            (width // 2, height // 2),
            (int(width // 2 - 75 * LINE_SCALE), int(height // 2 - 50 * LINE_SCALE)),
            LINE_COLOR,
            LINE_SIZE
        )

        # Display the captured frame
        cv2.imshow("Camera", frame)

        # Press 'q' to exit the loop
        if cv2.waitKey(1) == ord("q"):
            break

        if cv2.waitKey(1) == ord("c"):
            detect_face_color(frame)
        if cv2.waitKey(1) == ord("d"):
            print("Determining cube corners...")
            determine_cube_corners(frame)

    # Release the capture and writer objects
    print("Releasing capture and writer objects...")
    cam.release()
    out.release()
    cv2.destroyAllWindows()