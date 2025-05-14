<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    {{-- Using http-equiv for broader compatibility with some PDF libraries --}}
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Progress Bill</title>
    <style>
        body {
            /* Changed font-family to DejaVu Sans for better Unicode support */
            font-family: 'DejaVu Sans', sans-serif;
            margin: 40px;
            line-height: 1.5; /* Added for better readability */
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }
        .details {
            margin-bottom: 40px;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
        }
        .details td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
         /* Added some minor styling for strong tags in table for better visual separation */
         .details td strong {
             display: inline-block; /* Helps keep label and value on same line */
             min-width: 120px; /* Give labels a minimum width */
             margin-right: 10px;
         }
        .amount {
            text-align: right;
            margin-top: 40px;
            font-size: 18px;
            border-top: 2px solid #000;
            padding-top: 20px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
         /* Style for the peso symbol specifically if needed, though font-family should handle it */
         .peso-symbol {
             font-family: 'DejaVu Sans', sans-serif; /* Ensure peso symbol specifically uses this font */
         }
    </style>
</head>
<body>
    <div class="header">
        <h1>PROGRESS BILL</h1>
        {{-- Using Carbon to format date consistently, assuming $date is a Carbon instance or parseable string --}}
        <p>{{ \Carbon\Carbon::parse($date)->format('F d, Y') }}</p>
    </div>

    <div class="details">
        <table>
            <tr>
                <td><strong>Patient Name:</strong></td>
                <td>{{ $patient->name }}</td>
                <td><strong>Room:</strong></td>
                <td>{{ $room_number }}</td>
            </tr>
            <tr>
                <td><strong>Attending Physician:</strong></td>
                <td>{{ $attending_physician }}</td>
                <td><strong>Ward Type:</strong></td>
                <td>{{ $ward_type }}</td>
            </tr>
            <tr>
                <td><strong>Admission Date:</strong></td>
                 {{-- Using Carbon to format admission date, assuming $admission->created_at is parseable --}}
                <td>{{ Carbon\Carbon::parse($admission->created_at)->format('F d, Y') }}</td>
                <td><strong>Remarks:</strong></td>
                <td>{{ $remarks }}</td>
            </tr>
        </table>
    </div>

    <div class="amount">
        {{-- Hardcoded peso symbol before the formatted amount --}}
        <h2>Total Amount: <span class="peso-symbol">₱</span>{{ number_format($amount, 2) }}</h2>
    </div>

    <div class="footer">
        <p>This document is computer-generated.</p>
        <p>Generated on: {{ Carbon\Carbon::now()->format('F d, Y h:i A') }}</p>
    </div>
</body>
</html>