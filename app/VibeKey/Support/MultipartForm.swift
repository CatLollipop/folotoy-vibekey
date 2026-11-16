import Foundation

/// multipart/form-data 请求体(RFC 7578):每个部分以 `--boundary` 开头,最后以 `--boundary--` 结束。
nonisolated struct MultipartForm {
    let boundary = "VibeKey-\(UUID().uuidString)"
    private var parts: [Data] = []

    var contentType: String { "multipart/form-data; boundary=\(boundary)" }

    mutating func addField(name: String, value: String) {
        parts.append(Data("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n\(value)".utf8))
    }

    mutating func addFile(name: String, filename: String, mimeType: String, data: Data) {
        var part = Data("Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(filename)\"\r\nContent-Type: \(mimeType)\r\n\r\n".utf8)
        part.append(data)
        parts.append(part)
    }

    var body: Data {
        var body = Data()
        for part in parts {
            body.append(Data("--\(boundary)\r\n".utf8))
            body.append(part)
            body.append(Data("\r\n".utf8))
        }
        body.append(Data("--\(boundary)--\r\n".utf8))
        return body
    }
}
