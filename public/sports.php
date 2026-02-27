<?php
// sports.php - Backend for sports CRUD
header('Content-Type: application/json');

$filename = __DIR__ . '/sports_data.json';

function loadSports() {
    global $filename;
    if (!file_exists($filename)) return [];
    $data = file_get_contents($filename);
    return json_decode($data, true) ?: [];
}

function saveSports($sports) {
    global $filename;
    file_put_contents($filename, json_encode($sports, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all sports
    $sports = loadSports();
    echo json_encode(['success' => true, 'sports' => $sports]);
    exit;
}

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';
    $sports = loadSports();

    if ($action === 'add') {
        $name = $_POST['name'] ?? '';
        $desc = $_POST['desc'] ?? '';
        $image = $_POST['image'] ?? '';
        if (!$name || !$image) {
            echo json_encode(['success' => false, 'error' => 'Missing name or image']);
            exit;
        }
        $newId = time();
        $sports[] = [
            'id' => $newId,
            'name' => $name,
            'desc' => $desc,
            'image' => $image
        ];
        saveSports($sports);
        echo json_encode(['success' => true, 'sports' => $sports]);
        exit;
    }

    if ($action === 'edit') {
        $id = intval($_POST['id'] ?? 0);
        $name = $_POST['name'] ?? '';
        $desc = $_POST['desc'] ?? '';
        $image = $_POST['image'] ?? '';
        foreach ($sports as &$sport) {
            if ($sport['id'] == $id) {
                $sport['name'] = $name;
                $sport['desc'] = $desc;
                if ($image) $sport['image'] = $image;
            }
        }
        saveSports($sports);
        echo json_encode(['success' => true, 'sports' => $sports]);
        exit;
    }

    if ($action === 'delete') {
        $id = intval($_POST['id'] ?? 0);
        $sports = array_filter($sports, function($s) use ($id) { return $s['id'] != $id; });
        saveSports($sports);
        echo json_encode(['success' => true, 'sports' => array_values($sports)]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Invalid action']);
    exit;
}

// Fallback
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
exit;
