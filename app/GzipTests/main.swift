import Foundation

// 专项只需要本地化占位，不初始化应用、权限或任何网络服务。
extension Bundle { nonisolated static var l10n: Bundle { .main } }

@main
struct GzipTests {
    static func main() throws {
        var checks = 0
        func expect(_ value: @autoclosure () -> Bool, _ name: String) {
            precondition(value(), name)
            checks += 1
        }
        let codec = VolcengineCodec(apiKey: "offline-fixture", resourceID: "offline-fixture",
                                    options: .init(purpose: .dictation, language: .auto, vocabulary: []))
        func payload(_ message: URLSessionWebSocketTask.Message) throws -> Data {
            guard case .data(let frame) = message else { throw URLError(.cannotParseResponse) }
            let header = Array(frame.prefix(8))
            guard header.count == 8, header[0] == 0x11 else { throw URLError(.cannotParseResponse) }
            let length = header[4..<8].reduce(UInt32(0)) { ($0 << 8) | UInt32($1) }
            expect(Int(length) == frame.count - 8, "wire compressed length")
            return try Gzip.decompress(frame.dropFirst(8))
        }

        // 正式pump模型：prefix持有共享存储，removeFirst推进Data索引，尾块直接进入真实EOS。
        for size in [0, 1, 6_399, 6_400, 6_401, 12_799, 12_800, 12_801, 25_600] {
            let original = Data((0..<size).map { UInt8(truncatingIfNeeded: $0 &* 17) })
            let shared = original
            var pending = original
            var prefixes: [Data] = []
            var decoded = Data()
            while pending.count >= codec.chunkBytes {
                let chunk = pending.prefix(codec.chunkBytes)
                pending.removeFirst(codec.chunkBytes)
                prefixes.append(chunk)
                decoded.append(try payload(codec.audioMessage(Data(chunk))))
            }
            if size >= codec.chunkBytes {
                expect(pending.startIndex > 0, "regression must retain nonzero tail index")
            }
            let tail = pending
            let compressed = try Gzip.compress(pending)
            let restored = try Gzip.decompress(compressed)
            expect(restored == tail, "gzip nonzero-index/empty tail roundtrip")
            let messages = try codec.finishMessages(lastChunk: pending)
            expect(messages.count == 1, "EOS emitted once")
            guard case .data(let eos) = messages[0] else { throw URLError(.cannotParseResponse) }
            expect(Array(eos.prefix(4)) == [0x11, 0x22, 0x01, 0x00], "real Volc EOS flags/gzip")
            decoded.append(try payload(messages[0]))
            expect(decoded == original, "all audio frames plus EOS preserve exact bytes")
            expect(original == shared && tail == pending, "shared original and remaining tail unchanged")
            for (index, part) in prefixes.enumerated() {
                let lower = index * codec.chunkBytes
                expect(part == original.subdata(in: lower..<(lower + codec.chunkBytes)), "prefix alias unchanged")
            }
            withExtendedLifetime(shared) {}
            withExtendedLifetime(prefixes) {}
        }

        // 单字节非零slice和共享压缩slice同样只读借用，不进入Foundation Data可变切片API。
        let storage = Data([9, 8, 7, 6, 5])
        let one = storage.suffix(1)
        let oneCompressed = try Gzip.compress(one)
        let oneRestored = try Gzip.decompress(oneCompressed)
        expect(oneRestored == one, "single-byte suffix")
        var wrapped = Data(repeating: 0x7f, count: 17)
        let sample = Data("offline gzip boundary fixture".utf8)
        let compressedSample = try Gzip.compress(sample)
        wrapped.append(compressedSample)
        let sharedCompressed = wrapped.dropFirst(17)
        let restoredSample = try Gzip.decompress(sharedCompressed)
        expect(restoredSample == sample, "shared compressed suffix")
        expect(sharedCompressed == compressedSample, "compressed input alias unchanged")

        // 缺失任何gzip尾部都不能算成功；输入耗尽不替代Z_STREAM_END。
        for length in 0..<compressedSample.count {
            var rejected = false
            do { _ = try Gzip.decompress(sharedCompressed.prefix(length)) }
            catch { rejected = true }
            expect(rejected, "truncated gzip requires formal end")
        }
        let atLimit = Data(repeating: 0, count: Gzip.maxOutput)
        let atLimitCompressed = try Gzip.compress(atLimit)
        let atLimitRestored = try Gzip.decompress(atLimitCompressed)
        expect(atLimitRestored == atLimit, "exact 4MiB output remains allowed")
        let aboveLimit = Data(repeating: 0, count: Gzip.maxOutput + 1)
        let oversized = try Gzip.compress(aboveLimit)
        var limited = false
        do { _ = try Gzip.decompress(oversized) }
        catch Gzip.Failure.tooLarge { limited = true }
        expect(limited, "decompression output remains bounded at 4MiB")
        print("PASS: \(checks) production gzip/Volc EOS checks; nonzero/empty/shared slices, chunk boundaries, formal end and 4MiB limit")
    }
}
