import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;

public class FrontendProxyServer {
    private static final int PORT = 5173;
    private static final String BACKEND_BASE = "http://127.0.0.1:8082";
    private static final Set<String> PROXY_PREFIXES = Set.of("/api/", "/api", "/health", "/v3/", "/swagger-ui", "/uploads/");
    private static final Path DIST_DIR = Paths.get("dist").toAbsolutePath().normalize();
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public static void main(String[] args) throws Exception {
        if (!Files.isDirectory(DIST_DIR)) {
            throw new IllegalStateException("Build output not found: " + DIST_DIR);
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new Handler());
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println("Frontend proxy server listening on http://127.0.0.1:" + PORT);
        System.out.println("Serving frontend from " + DIST_DIR);
        System.out.println("Proxying API traffic to " + BACKEND_BASE);
    }

    private static final class Handler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            URI requestUri = exchange.getRequestURI();
            String path = requestUri.getPath();

            try {
                if (shouldProxy(path)) {
                    proxy(exchange);
                    return;
                }

                if (!isReadMethod(exchange.getRequestMethod())) {
                    sendText(exchange, 405, "Method not allowed.");
                    return;
                }

                serveStatic(exchange, path);
            } catch (Exception ex) {
                if (!exchange.getResponseHeaders().containsKey("Content-Type")) {
                    exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
                }
                byte[] body = ("Frontend server error: " + ex.getMessage()).getBytes();
                exchange.sendResponseHeaders(500, body.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(body);
                }
            }
        }
    }

    private static boolean shouldProxy(String path) {
        for (String prefix : PROXY_PREFIXES) {
            if (path.equals(prefix) || path.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    private static boolean isReadMethod(String method) {
        return "GET".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method);
    }

    private static void proxy(HttpExchange exchange) throws IOException, InterruptedException {
        URI requestUri = exchange.getRequestURI();
        URI backendUri = URI.create(BACKEND_BASE + requestUri.toString());

        byte[] requestBody;
        try (InputStream is = exchange.getRequestBody()) {
            requestBody = is.readAllBytes();
        }

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder(backendUri)
                .timeout(Duration.ofSeconds(30))
                .method(exchange.getRequestMethod(), requestBody.length == 0
                        ? HttpRequest.BodyPublishers.noBody()
                        : HttpRequest.BodyPublishers.ofByteArray(requestBody));

        copyRequestHeaders(exchange.getRequestHeaders(), requestBuilder);

        HttpResponse<byte[]> response = HTTP_CLIENT.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofByteArray());
        Headers responseHeaders = exchange.getResponseHeaders();
        copyResponseHeaders(response.headers().map(), responseHeaders);

        byte[] responseBody = response.body();
        if ("HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(response.statusCode(), -1);
        } else {
            exchange.sendResponseHeaders(response.statusCode(), responseBody.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(responseBody);
            }
        }
    }

    private static void copyRequestHeaders(Headers incoming, HttpRequest.Builder requestBuilder) {
        for (Map.Entry<String, List<String>> entry : incoming.entrySet()) {
            String name = entry.getKey();
            if (name == null) {
                continue;
            }
            String lower = name.toLowerCase(Locale.ROOT);
            if ("host".equals(lower) || "content-length".equals(lower) || "connection".equals(lower)) {
                continue;
            }
            for (String value : entry.getValue()) {
                requestBuilder.header(name, value);
            }
        }
    }

    private static void copyResponseHeaders(Map<String, List<String>> source, Headers target) {
        for (Map.Entry<String, List<String>> entry : source.entrySet()) {
            String name = entry.getKey();
            if (name == null) {
                continue;
            }
            String lower = name.toLowerCase(Locale.ROOT);
            if ("content-length".equals(lower) || "transfer-encoding".equals(lower) || "connection".equals(lower)) {
                continue;
            }
            target.put(name, entry.getValue());
        }
    }

    private static void serveStatic(HttpExchange exchange, String path) throws IOException {
        Path filePath = resolveAsset(path);
        if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
            filePath = DIST_DIR.resolve("index.html");
        }

        String contentType = probeContentType(filePath);
        byte[] body = Files.readAllBytes(filePath);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.getResponseHeaders().set("Cache-Control", filePath.getFileName().toString().equals("index.html")
                ? "no-cache"
                : "public, max-age=31536000, immutable");

        if ("HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(200, -1);
            return;
        }

        exchange.sendResponseHeaders(200, body.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private static Path resolveAsset(String rawPath) {
        String normalized = rawPath == null || rawPath.isBlank() ? "/" : rawPath;
        Path candidate = normalized.equals("/") ? DIST_DIR.resolve("index.html") : DIST_DIR.resolve(normalized.substring(1)).normalize();
        if (!candidate.startsWith(DIST_DIR)) {
            return DIST_DIR.resolve("index.html");
        }
        if (Files.exists(candidate) && Files.isDirectory(candidate)) {
            return candidate.resolve("index.html");
        }
        if (Files.exists(candidate)) {
            return candidate;
        }
        if (!normalized.contains(".")) {
            return DIST_DIR.resolve("index.html");
        }
        return candidate;
    }

    private static String probeContentType(Path filePath) {
        try {
            String contentType = Files.probeContentType(filePath);
            if (contentType != null) {
                return contentType;
            }
        } catch (IOException ignored) {
        }

        String name = filePath.getFileName().toString().toLowerCase(Locale.ROOT);
        if (name.endsWith(".html")) return "text/html; charset=utf-8";
        if (name.endsWith(".js") || name.endsWith(".mjs")) return "application/javascript; charset=utf-8";
        if (name.endsWith(".css")) return "text/css; charset=utf-8";
        if (name.endsWith(".json")) return "application/json; charset=utf-8";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
        if (name.endsWith(".webp")) return "image/webp";
        if (name.endsWith(".ico")) return "image/x-icon";
        return "application/octet-stream";
    }

    private static void sendText(HttpExchange exchange, int status, String message) throws IOException {
        byte[] body = message.getBytes();
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
        exchange.sendResponseHeaders(status, body.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(body);
        }
    }
}
