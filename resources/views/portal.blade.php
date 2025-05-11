<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Portal</title>
    <!-- Pass the hash as a global variable -->
    <script>
        window.patientHash = "{{ $hash }}";
    </script>
    
    <!-- If you have a separate build for React -->
    <link rel="stylesheet" href="{{ asset('react/dist/index.css') }}">
</head>
<body>
    <div id="root"></div>
    
    <!-- Include your React build -->
    <script src="{{ asset('react/dist/index.js') }}"></script>
</body>
</html>